# UC-001 DB Migration Plan — Project Intake Context

> **Related use case:** `docs/v0.2/v0.2.1/use-cases/uc-001-flexible-brief-intake.md`

---

## 1. Goal

Move Project Intake from the legacy `projects.brief` / `projects.brief_messages` model to:

- `projects.context` as the authoritative Markdown project context.
- `projects.intake_status` as the gate for opening Project Intake.
- `project_conversations.messages` as the persisted intake conversation thread.

The migration must preserve existing useful project data by composing `projects.context` from the base System Overview and legacy brief before dropping `projects.brief`.

---

## 2. Target Schema

### `projects`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `context` | `longText` | yes | `null` | Markdown source of truth for downstream generation |
| `intake_status` | `string` | no | `draft` | `draft`, `processing`, `needs_input`, `ready`, `failed` |
| `intake_processing_at` | `timestamp` | yes | `null` | Concurrency lock timestamp |
| `manual_context_disclaimer_accepted_at` | `timestamp` | yes | `null` | Audit marker for manual context path |

Remove after backfill and downstream code migration:

| Column | Reason |
| --- | --- |
| `brief` | Replaced by Markdown `context` |
| `brief_messages` | Replaced by `project_conversations.messages` |

### `project_conversations`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `ulid` | no | generated | Primary key |
| `project_id` | FK | no | - | References `projects.id`, cascade delete |
| `user_id` | FK | no | - | Conversation creator |
| `mode` | `string` | no | `chat` | `chat`, `manual_context`, future `context_edit` |
| `title` | `string` | yes | `null` | Sidebar label |
| `status` | `string` | no | `active` | `active`, `archived` |
| `is_current` | `boolean` | no | `false` | Current conversation marker |
| `messages` | `json` | yes | `null` | Ordered message array |
| `created_at` / `updated_at` | timestamps | no | - | Laravel timestamps |

Indexes:

- `(project_id, is_current)`
- `(project_id, updated_at)`
- `(project_id, mode)`

---

## 3. Migration Order

### Migration 1 — Add Project Intake Columns

File:

`laravel/database/migrations/YYYY_MM_DD_HHMMSS_add_project_intake_columns_to_projects_table.php`

Operations:

1. Add `context` as nullable `longText`.
2. Add `intake_status` as string with default `draft`.
3. Add `intake_processing_at` as nullable timestamp.
4. Add `manual_context_disclaimer_accepted_at` as nullable timestamp.
5. Add index on `intake_status`.

Rollback:

1. Drop the index.
2. Drop the four new columns.

### Migration 2 — Create Project Conversations Table

File:

`laravel/database/migrations/YYYY_MM_DD_HHMMSS_create_project_conversations_table.php`

Operations:

1. Create `project_conversations`.
2. Use `ulid('id')->primary()`.
3. Add `foreignId('project_id')->constrained()->cascadeOnDelete()`.
4. Add `foreignId('user_id')->constrained()->cascadeOnDelete()`.
5. Add `mode`, `title`, `status`, `is_current`, `messages`.
6. Add indexes listed in Section 2.

Rollback:

1. Drop `project_conversations`.

### Migration 3 — Backfill Context From Legacy Data

File:

`laravel/database/migrations/YYYY_MM_DD_HHMMSS_backfill_project_context_from_legacy_sources.php`

Operations per project:

1. Find base System Overview:
   - Prefer `project_overview_versions.is_base_version = true`.
   - If none exists, use the newest overview version only if product agrees; otherwise skip overview source.
2. Read legacy `projects.brief` if non-empty.
3. Build Markdown context:

```markdown
# Project Context

## System Overview

{base overview content}

## Project Brief (Legacy)

{legacy brief content}
```

4. If both sources are empty:
   - Leave `context = null`.
   - Set `intake_status = draft` unless already manually set.
5. If either source exists:
   - Set `context` to composed Markdown.
   - Set `intake_status = ready`.

Rollback:

- Do not attempt to reconstruct old data from `context`.
- Set `context = null` only if the migration can reliably identify rows it wrote, for example by a temporary audit marker.
- Prefer a no-op rollback if this migration runs in production.

### Migration 4 — Deploy Downstream Code Changes

This is an application deployment step, not a schema migration.

All `brief` readers must be moved to `context` before dropping `brief`.

Required consumers:

| Location | Required change |
| --- | --- |
| `SystemOverviewController` | Use `$project->context` for generation/regeneration/chat payload context |
| `TechnicalDetailsController` | Require `context` instead of `brief` |
| `ArchitectureController` | Fallback to `baseOverviewVersion ?? context` |
| `ProjectERDController` | Use `context` in project overview fallback |
| `PRD.tsx` | Use `project.context` as fallback content |
| `projectNav.ts` / navigation utilities | Gate on `intake_status`, not `brief` |
| Project show/index/dashboard/invitation pages | Render truncated `context` previews |
| Factories and seeders | Replace `brief` with `context` + `intake_status` |
| FastAPI chat models/controllers | Rename `project_brief` input concept to `project_context` |

Validation before continuing:

1. Search app code for `project.brief`, `$project->brief`, `'brief' =>`, and `brief_messages`.
2. Confirm every required usage is removed, renamed, or explicitly legacy-only.
3. Run Laravel and frontend tests.

### Migration 5 — Drop Legacy Columns

File:

`laravel/database/migrations/YYYY_MM_DD_HHMMSS_drop_legacy_brief_columns_from_projects_table.php`

Operations:

1. Drop `brief_messages` if it exists.
2. Drop `brief`.

Rollback:

1. Re-add nullable `brief` text.
2. Re-add nullable `brief_messages` JSON if needed.
3. Do not attempt to repopulate them automatically; `context` remains authoritative.

---

## 4. Deployment Strategy

Recommended deployment sequence:

1. Deploy Migration 1 and Migration 2.
2. Deploy code that writes new intake data to `context` and `project_conversations`.
3. Run Migration 3 backfill.
4. Deploy downstream reader changes from `brief` to `context`.
5. Verify no runtime reads from `brief`.
6. Deploy Migration 5 to drop legacy columns.

This avoids a window where downstream generation has no context source.

---

## 5. Data Safety Checks

Before Migration 3:

- Count projects with non-empty `brief`.
- Count projects with a base System Overview.
- Count projects with neither source.

After Migration 3:

- Count projects where `context` is non-empty.
- Count projects marked `intake_status = ready`.
- Sample projects with both overview and brief to confirm both headings are present.
- Sample projects with only brief.
- Sample projects with only overview.
- Confirm projects with neither source remain `draft`.

Before Migration 5:

- Confirm no app code reads `brief` or `brief_messages`.
- Confirm downstream AI generation works from `context`.
- Confirm project navigation uses `intake_status`.

---

## 6. Test Plan

### Pest Feature Tests

- Migrates old brief into `context` and marks project `ready`.
- Migrates base overview into `context` and marks project `ready`.
- Migrates both overview and brief under separate headings.
- Leaves empty projects as `draft`.
- Project navigation redirects to intake when `intake_status != ready`.
- Project navigation allows downstream pages when `intake_status = ready`.
- Conversation messages persist in `project_conversations.messages`.

### Regression Tests

- System Overview generation uses `context`.
- Technical Details generation uses `context`.
- ERD/Architecture fallback uses `context`.
- Dashboards and invitations render context previews without referencing `brief`.

---

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Dropping `brief` while code still reads it | Add search verification gate before Migration 5 |
| Bad legacy context composition | Sample migrated rows before deploy continuation |
| Huge context content | Use `longText`; apply UI/API length limits for future edits |
| Duplicate active conversations | Enforce one current conversation per project/mode in service layer |
| Rollback after drop loses legacy columns | Treat `context` as authoritative after Migration 3; rollback only restores columns, not old content |

---

## 8. Implementation Checklist

- [ ] Add `context`, `intake_status`, `intake_processing_at`, `manual_context_disclaimer_accepted_at`.
- [ ] Create `project_conversations`.
- [ ] Add `ProjectConversation` model and relationships.
- [ ] Backfill `context` from base overview + old brief.
- [ ] Update downstream readers to `context`.
- [ ] Update factories and seeders.
- [ ] Verify no `brief` / `brief_messages` runtime dependencies remain.
- [ ] Drop `brief` and `brief_messages`.
- [ ] Add migration and regression tests.
