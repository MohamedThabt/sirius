# Sirius — Future Vision & Product Roadmap

> **From "What should we build?" → "What are we building?" → "Are we building it right?"**
>
> Sirius is evolving from an AI documentation generator into the **AI-native SDLC Operating System** for serious engineering teams.

---

## Strategic North Star

The documentation generation market will commoditize fast. Sirius's defensible moat is not generation — it's **accumulated project intelligence**: architecture memory, traceability graphs, drift detection, and cross-tool synchronization. Every version below moves Sirius further toward becoming the system that knows your project better than your team does.

---

## V0.2.0 — The Intelligence Foundation

> **Theme: Stop asking questions. Start understanding projects.**

### Intelligent Requirements Agent

Replace the current deterministic question-flow with a conversational, context-aware requirements agent.

**Input modalities:**
- One-shot text description (paste a brief, idea, or problem statement)
- File uploads (PRDs, wireframes, spreadsheets, existing docs, images)
- GitHub repository URL (agent reads codebase structure, README, existing docs)
- Any combination of the above

The agent iterates with the user through open dialogue — asking only what matters, inferring what it can, and surfacing assumptions for validation rather than hammering users with forms.

**Agent capabilities:**
- Understands ambiguity and asks clarifying questions intelligently
- Extracts implicit requirements from uploaded materials
- Detects contradictions or gaps in the brief
- Produces a structured **Project Knowledge Base** as its primary output

---

### Project Knowledge Base

The living brain of every Sirius project. Built automatically from the requirements agent output, and continuously enriched as the project evolves.

Contains:
- Domain model and core entities
- Business rules and constraints
- Stakeholder goals and success metrics
- Technical preferences and stack decisions
- Architectural decisions and their rationale
- Open questions and assumptions

The Knowledge Base is the single source of truth that feeds all document generation — not raw user input.

---

### Flexible Document Generation Suite

Users choose which documents to generate. All docs are generated from the Knowledge Base, ensuring consistency across the full suite.

| Document Type | Description |
|---|---|
| **PRD** *(default)* | Product Requirements Document — scope, goals, requirements, metrics |
| **System Use Cases / User Stories** | Full specs with acceptance criteria, flows, and edge cases |
| **Architecture Diagrams (C4)** | Context, Container, Component, and Code-level C4 diagrams |
| **System DB Design / ERD** | Entity-relationship diagrams at module and system level |
| **Technical Specs** | Implementation-level engineering specs per feature/module |
| **Agent.md** | Structured context files for AI coding agents (Cursor, Claude Code, etc.) |
| **Claude.md** | Claude-specific project context and instruction files |
| **Design.md** | Design system rules, component patterns, UX principles |
| **API Specification** | OpenAPI / REST / GraphQL contract definitions |
| **Frontend Page Specification** | Per-page UI specs with components, states, and data requirements |
| **DFD Diagram** | Data Flow Diagrams showing how data moves through the system |

Users can generate any subset, regenerate individual documents, and customize templates.

---

### V0.2.x — Polish & Minor Improvements

Incremental releases under V0.2.0 will address:

- `V0.2.1` — Improved diagram rendering and Mermaid validation
- `V0.2.2` — Document version history and diff view
- `V0.2.3` — Template customization per document type
- `V0.2.4` — Bulk regeneration when Knowledge Base is updated
- `V0.2.5` — Export improvements (PDF, Notion, Confluence)
- `V0.2.x` — Bug fixes, performance improvements, UI polish

---

## V0.3.0 — Project Execution Layer

> **Theme: Turn specs into work. Manage that work anywhere.**

Documentation that never connects to actual execution is documentation that dies. V0.3.0 bridges the gap between planning and delivery.

### AI-Generated Issues & Tasks

After system planning is complete, the agent automatically breaks down features and user stories into actionable tasks and issues — with:

- Estimated complexity
- Dependency relationships
- Suggested assignees based on module ownership
- Acceptance criteria linked to the originating spec

### Task Management in Sirius

Users can manage their backlog directly inside Sirius:

- Kanban board and list views
- Priority and status tracking
- Link tasks back to specs, diagrams, and user stories
- Sprint planning with AI assistance

### Export to Your Tools

One-click export and two-way sync with:

- **GitHub Issues** — with labels, milestones, and linked PRs
- **Linear** — with project and team mapping
- **Jira** — with epic/story/task hierarchy
- **Notion** — as a structured database

### MCP for AI Coding Agents

Sirius exposes a **Model Context Protocol (MCP) server** so AI coding agents can read full project context before generating code.

Agents receive:
- Architecture and module structure
- Relevant user stories and acceptance criteria
- Database schema and entity relationships
- API contracts
- Coding conventions and standards

This solves the core problem of AI-generated code that doesn't match the intended architecture.

---

## V0.4.0 — Living Architecture Intelligence

> **Theme: From planning tool to engineering operating system.**

V0.4.0 converts Sirius from a planning tool into a continuous intelligence layer that answers the questions teams ask every day.

### The Questions V0.4.0 Answers

| Question | Sirius Capability |
|---|---|
| *"What changed?"* | Changelog intelligence from GitHub commits, PRs, and migrations |
| *"What's blocked?"* | Dependency graph with blocker detection and standup summaries |
| *"Is engineering aligned?"* | Spec-to-code traceability across every feature |
| *"Is architecture drifting?"* | Automated drift detection against original PRD and DDD boundaries |
| *"Are we following the original spec?"* | Requirement coverage analysis per sprint |
| *"What should AI agents do next?"* | Spec-aware task routing to Cursor, Claude Code, Copilot, and Devin |

---

### Living Documentation Engine

The most important retention feature. Documentation that auto-updates itself as the project evolves.

Sirius monitors:
- GitHub commits and merged PRs
- Database migrations
- API contract changes
- AI coding agent outputs

On every significant change, Sirius automatically:
- Updates affected ERDs
- Refreshes API contract documentation
- Updates sequence diagrams
- Highlights requirement drift (spec said X, code does Y)
- Flags impacted user stories

**Retention effect:** Teams return daily because Sirius knows the current architecture better than their own docs folder.

---

### Architecture Drift Detection

Enterprise-grade value. Sirius continuously compares:

- Original PRD and architecture decisions
- Current codebase structure
- Database migrations
- API surfaces and service dependencies

Detects and reports:
- Requirements that were never implemented
- Modules that exist in code but not in specs
- Dead APIs and unused services
- Naming inconsistencies across layers
- DDD boundary violations (e.g., `NotificationService` directly accessing `UserDB`)

---

### AI Sprint Manager

Sirius becomes operationally aware:

- Auto-generate sprint plans from the backlog
- Estimate complexity using historical project data
- Visualize dependency graphs and critical paths
- Detect blocked tasks before standup
- Generate AI-written standup summaries
- Act as an AI Scrum Master for async teams

---

### Task → Code → Spec Traceability

Every feature becomes a complete audit trail:

```
Feature: Refund Payments
├── PRD requirement
├── User story + acceptance criteria
├── Sequence diagram
├── API contract
├── DB schema changes
├── GitHub commits
├── Pull requests
├── Bugs reported
└── Deployments
```

Sirius becomes the single source of truth across the entire delivery lifecycle.

---

### AI Technical Decision Memory

Engineering teams forget *why* decisions were made. Sirius remembers.

- Store architecture decisions with full rationale
- Record rejected approaches and tradeoffs
- Capture meeting outcomes and pivots
- Answer questions like *"Why did we reject MongoDB?"* with historical context

Invaluable for onboarding and long-running projects.

---

### Release & Change Impact Analyzer

Before any merge or deployment, Sirius analyzes:

- Which modules are affected
- Which APIs change or break
- Which frontend pages depend on the change
- Database schema impact
- Downstream service dependencies

Example output:
```
Changing invoice schema affects:
- Billing API (breaking change)
- Mobile app (needs client update)
- Stripe sync job (potential data mismatch)
- Reporting dashboard (query rewrite needed)
```

---

### AI Developer Copilot (Project-Aware)

Not generic AI chat. A copilot that knows *your* project.

Sirius holds:
- Full architecture context
- Module ownership and boundaries
- Naming conventions and coding standards
- Business logic and rules
- Historical decisions

Example prompts that just work:
- *"Generate Laravel policies for the Invoice module"*
- *"Add subscription cancellation flow — which services are affected?"*
- *"Which modules will break if we change the RBAC middleware?"*

---

### AI Agent Orchestration

Sirius as the **brain** for your AI coding agents.

Integrates with: Cursor, Claude Code, GitHub Copilot, OpenAI Codex, and Devin-style agents.

Sirius sends agents exactly what they need:
- Scoped specs for the current task
- Acceptance criteria
- Architecture constraints
- Relevant DB schema and API contracts
- Coding standards

This eliminates the #1 AI coding failure mode: agents that build the wrong architecture because they lacked project context.

---

## Product Evolution Summary

```
Phase 1 — Planning (V0.1 → V0.2)
  PRDs, ERDs, diagrams, specs, flexible doc suite

Phase 2 — Execution (V0.3)
  Tasks, sprint planning, GitHub/Linear/Jira/Notion sync, MCP for agents

Phase 3 — Intelligence (V0.4)
  Architecture drift, dependency graph, code/spec alignment, release impact

Phase 4 — Autonomous Engineering (V0.5+)
  AI agents, automated doc updates, AI QA, AI architecture review, AI release validation
```

---

## Marketing Plan

### Content Strategy — Video-First

#### Release Videos (Every Version)
Publish on **X (Twitter)**, **LinkedIn**, and **YouTube** for every release and significant feature drop.

Video structure that converts:
1. **Open with the pain** (15 seconds) — show the problem viscerally. A Slack thread with 200 messages about what a feature should do. A PRD that's 3 months out of date.
2. **Demo the solution** (60–90 seconds) — show Sirius solving it, live and uncut. Real project, real output.
3. **Close with the outcome** (15 seconds) — "This used to take 3 days. This took 4 minutes."

Keep release videos under 3 minutes. YouTube versions can be longer (5–8 min) with more depth.

---

#### Technical Deep-Dive Series

Document your engineering challenges publicly. This builds trust, attracts engineers, and creates organic distribution through developer communities.

**Recommended topics:**

| Episode | Topic |
|---|---|
| 1 | How we built an AI agent that understands GitHub repositories |
| 2 | Generating valid Mermaid diagrams at scale (and how we fixed the hallucinations) |
| 3 | Building a living documentation engine — sync, drift, and conflict resolution |
| 4 | Why we built our own MCP server and what we learned |
| 5 | Architecture drift detection: comparing PRDs to real codebases |
| 6 | How we built C4 diagram generation that actually makes sense |
| 7 | The traceability graph: connecting specs to commits to deployments |

These videos perform well on YouTube and LinkedIn because they answer real questions developers search for. They also position Sirius as a technically credible team — not just another AI wrapper.

---

### Channel-Specific Approach

**X (Twitter / Developer Audience)**
- Short demos (under 60 seconds) showing before/after
- Thread breakdowns of interesting technical decisions
- Share early access to new features with the developer community
- Engage with conversations about AI coding, PRDs, engineering productivity
- Post-launch metrics and learnings ("We shipped V0.2 — here's what users actually do")

**LinkedIn (Engineering Leads & Product Managers)**
- Longer-form posts on the problems Sirius solves (documentation debt, spec-to-code drift, onboarding costs)
- Case study content: "This team cut pre-code planning from 2 weeks to 2 days"
- Thought leadership on AI-native software development
- Target: CTOs, VP Engineering, Senior PMs, Tech Leads at startups and agencies

**YouTube (Discovery & Depth)**
- Full release walkthroughs with context
- Technical series (as above)
- "Sirius vs. doing it manually" comparison videos
- Tutorial content: "Build your first project in Sirius in 10 minutes"
- Searchable titles: people search for "how to write a PRD fast", "AI architecture diagram generator", "project documentation tool"

---

### Content Calendar Framework

| Trigger | Content to Produce |
|---|---|
| New version release | Release video (all 3 channels) + written announcement |
| New major feature | Short demo video + LinkedIn post explaining the problem it solves |
| Technical milestone | Deep-dive video + thread on X |
| User story / case study | LinkedIn post + short testimonial clip |
| Industry moment (AI coding trend, etc.) | Opinion post connecting it to Sirius's thesis |

---

### Positioning Recommendations

The crowded message: *"AI generates your docs"* — avoid this.

The defensible message: **"Sirius keeps your engineering team aligned — from the first idea to the last deployment."**

Emphasize:
- **Living documentation** (not static generation)
- **Architecture intelligence** (not just pretty diagrams)
- **Team alignment** (not a solo developer tool)
- **The full SDLC** (not just the planning phase)

The long-term brand position is: *"The engineering operating system for teams who build seriously."* Every piece of content should reinforce that Sirius understands what serious engineering actually looks like — and that vibe-coding, scattered Notion pages, and stale PRDs are not it.

---

*Last updated: May 2026 — Sirius V0.2.0 planning cycle*