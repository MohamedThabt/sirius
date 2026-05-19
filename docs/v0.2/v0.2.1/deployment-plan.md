# v0.2.1 Deployment & Release Plan

## 1. Overview
This document outlines the deployment and release strategy for the **v0.2.1** updates to Sirius, encompassing three major architectural additions:
- **UC-001:** Flexible Project Brief Intake (replaces legacy Prepare wizard)
- **UC-002:** Project Knowledge Base (KB) processing and versioning
- **UC-003:** Node-based Project Canvas for artifact generation

## 2. Infrastructure & Environment Requirements
Before deployment, verify the following infrastructure dependencies:
- **File Storage (S3 / Local):** Ensure storage permissions are configured for tracking raw uploaded files (PDFs, DOCX, etc.).
- **Redis:** Required for LangGraph agent state/checkpoints during long-running tasks and Laravel Queues.
- **WebSocket Server (Pusher / Laravel Reverb):** Ensure it's active and properly configured to handle real-time UI updates for KB merges and Canvas status changes.
- **Python Dependencies:** The FastAPI service now requires `pymupdf` and `docx2txt` for document extraction, plus `langgraph` for the workflow agents.

## 3. Database Migrations
The v0.2.1 release involves critical database schema changes. Ensure existing records are not compromised (especially `projects.brief`).

### Schema Additions:
1. **Intake Flow (projects update):** 
   - Add columns: `brief_messages` (JSON), `context` (JSON), `intake_status`, `intake_processing_at`.
   - Create tables: `project_files`, `project_repos`.
2. **Knowledge Base:** 
   - Create tables: `project_knowledge_bases`, `kb_sections`, `kb_sources`, `kb_merge_jobs`, `kb_section_history`.
3. **Project Canvas:** 
   - Create tables: `project_canvases`, `canvas_nodes`, `canvas_edges`, `canvas_artifacts`, `canvas_generation_jobs`.

## 4. Deployment Sequence

### Phase 1: Preparation
1. Announce maintenance window to users (if applicable).
2. **Take a full database snapshot/backup.**
3. Verify that all environment variables are present in production (e.g., GitHub tokens, LLM API keys for the new modules).

### Phase 2: FastAPI Deployment
1. Pull the latest FastAPI code.
2. Install updated dependencies: `pip install -r requirements.txt`.
3. Restart FastAPI workers/containers.
4. Verify HTTP and health endpoints to ensure the process starts correctly.

### Phase 3: Laravel & Frontend Deployment
1. Put the Laravel app into maintenance mode:
   ```bash
   php artisan down --secret="v02-release"
   ```
2. Pull the latest Laravel and React code.
3. Install PHP & Node dependencies:
   ```bash
   composer install --no-dev --optimize-autoloader
   pnpm install
   ```
4. Run migrations:
   ```bash
   php artisan migrate --force
   ```
5. Build the React/Inertia frontend (note: verify `React Flow` package installation):
   ```bash
   pnpm run build
   ```
6. Restart background queues and WebSocket servers:
   ```bash
   php artisan queue:restart
   php artisan reverb:restart  # or equivalent command for your WS server
   ```
7. Clear and cache configurations:
   ```bash
   php artisan optimize:clear
   php artisan optimize
   ```
8. Take application out of maintenance mode:
   ```bash
   php artisan up
   ```

## 5. Post-Deployment Validation (Smoke Tests)
Perform these tests immediately after exiting maintenance mode:
- **Intake Flow Check:** Create a new project. Validate that the UI routes to `/projects/{project}/brief-intake` (not `/prepare`). Send a message with text; verify the AI responds correctly with clarifications or readiness.
- **KB Processing Check:** Upload a sample `pdf` or `txt` file to the KB of an active project. Verify the async Merge Job updates the relevant KB sections.
- **Canvas Validation:** Go to the Project Canvas. Create a new artifact node (e.g., `PRD`), attach it, and click "Generate". Ensure the Job completes, the WebSocket receives the update, and the markdown generates.
- **Legacy Projects Check:** Ensure existing projects still render properly and preserve existing `brief` texts. 

## 6. Rollback Plan
If critical issues occur post-deployment:
1. Turn on maintenance mode: `php artisan down`.
2. Revert Laravel, React, and FastAPI code to the pre-release commit.
3. Re-map the database using the pre-deployment snapshot to reverse state mutations (only if corrupted).
4. Restart FastAPI container, Laravel workers, and WebSocket servers.
5. Disable maintenance mode: `php artisan up`.
