# Project Modules Creation Flow

## Overview

This document explains the complete flow for creating project modules in Sirius, including the different approaches available, the context used for AI generation, and the rationale behind our design decisions.

---

## Module Creation Approaches

Sirius provides **two main approaches** for creating modules:

### 1. Generate Modules (Bulk Creation)
**When to use:** Starting a new project with no existing modules.

### 2. Add Module (Single Creation)
**When to use:** Adding a new module to an existing project with modules.

---

## Flow 1: Generate Modules (Bulk Creation)

This is a **3-stage process** for initial module discovery and creation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: SUGGESTION                                  │
│                                                                             │
│  Input:  Project Overview (description)                                     │
│  Output: List of suggested modules (name + description)                     │
│  API:    POST /v1/modules/suggestion/generate                               │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────────────────┐     │
│  │   Project   │ ───► │   FastAPI   │ ───► │  8-12 Module Suggestions │     │
│  │  Overview   │      │   (Gemini)  │      │  (Name + Description)    │     │
│  └─────────────┘      └─────────────┘      └─────────────────────────┘     │
│                                                                             │
│  Features:                                                                  │
│  • AI analyzes project description using DDD principles                     │
│  • Suggests bounded contexts as modules                                     │
│  • Cached in `suggested_modules` table for re-visits                        │
│  • User can regenerate with feedback notes                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 2: USER SELECTION                              │
│                                                                             │
│  • User reviews suggested modules                                           │
│  • Selects which modules to include in the project                          │
│  • Can provide feedback and regenerate if needed                            │
│  • Typical: Select 5-8 modules from 8-12 suggestions                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3: ENRICHMENT                                  │
│                                                                             │
│  Input:  Selected modules + Project Overview + Technical Intake             │
│  Output: Enriched modules (metrics, enhanced description, order)            │
│  API:    POST /v1/modules/details/generate                                  │
│                                                                             │
│  ┌──────────────────┐      ┌─────────────┐      ┌─────────────────────┐    │
│  │ Selected Modules │      │             │      │  Enriched Modules   │    │
│  │ Project Overview │ ───► │   FastAPI   │ ───► │  • Enhanced desc    │    │
│  │ Technical Intake │      │   (Gemini)  │      │  • Business metrics │    │
│  └──────────────────┘      └─────────────┘      │  • Impl. order      │    │
│                                                  └─────────────────────┘    │
│                                                                             │
│  AI Chain of Thought:                                                       │
│  1. Dependency Analysis - Which modules depend on others?                   │
│  2. Implementation Order - What's the optimal build sequence?               │
│  3. Metrics Approach - What KPIs prove each module works?                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 4: CREATION                                    │
│                                                                             │
│  • Enriched modules saved to `modules` table                                │
│  • Suggested modules cache cleared                                          │
│  • User redirected to Modules Index page                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Regeneration Flow (Optional)

If user is not satisfied with suggestions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REGENERATION                                         │
│                                                                             │
│  Input:  Previous modules + User feedback notes + Project Overview          │
│  Output: New set of suggested modules                                       │
│  API:    POST /v1/modules/suggestion/regenerate                             │
│                                                                             │
│  Example feedback:                                                          │
│  "Add a module for real-time notifications. Remove the analytics module,    │
│   we'll use a third-party service. Split User Management into Auth and      │
│   Profile modules."                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow 2: Add Module (Single Creation)

This is a **single-step process** for adding modules to existing projects.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SINGLE MODULE CREATION                               │
│                                                                             │
│  Input:                                                                     │
│  • New module name (user provided)                                          │
│  • New module description (user provided)                                   │
│  • Project Overview (context)                                               │
│  • Existing modules list (context)                                          │
│                                                                             │
│  Output: Single enriched module                                             │
│  API:    POST /v1/modules/single/generate                                   │
│                                                                             │
│  ┌──────────────────────┐      ┌─────────────┐      ┌──────────────────┐   │
│  │ User Input:          │      │             │      │ Enriched Module: │   │
│  │ • Name               │      │             │      │ • Enhanced desc  │   │
│  │ • Description        │ ───► │   FastAPI   │ ───► │ • Metrics        │   │
│  │                      │      │   (Gemini)  │      │ • Impl. order    │   │
│  │ Context:             │      │             │      │   (relative to   │   │
│  │ • Project Overview   │      │             │      │    existing)     │   │
│  │ • Existing Modules   │      │             │      └──────────────────┘   │
│  └──────────────────────┘      └─────────────┘                             │
│                                                                             │
│  AI Chain of Thought:                                                       │
│  1. Context Analysis - How does this fit with existing modules?             │
│  2. Integration Points - What are the dependencies?                         │
│  3. Metrics Rationale - What KPIs are appropriate?                          │
│  4. Order Rationale - Where in the build sequence should this go?           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Context Used for AI Generation

### Why Context Matters

AI-generated modules are only as good as the context provided. Poor context leads to:
- Generic, non-specific modules
- Wrong implementation ordering
- Irrelevant metrics
- Missing integration considerations

### Context Components

| Context | Used In | Purpose |
|---------|---------|---------|
| **Project Overview** | All flows | Core business domain understanding |
| **Technical Intake** | Bulk enrichment | Technology stack considerations |
| **Previous Modules** | Regeneration | Learn from user preferences |
| **User Feedback** | Regeneration | Direct user intent |
| **Existing Modules** | Single creation | Integration and ordering context |

### Project Overview Context

The project overview is the **most critical context**. It contains:
- Business domain description
- Target users and their needs
- Core functionality requirements
- Business goals and constraints

**Example:**
```
"An e-commerce platform for handmade crafts that connects artisans 
with buyers. Features include product listings with custom attributes, 
secure checkout with multiple payment options, order tracking, 
seller dashboard with analytics, and a review system."
```

From this, AI can identify:
- **User Management** (buyers, sellers, admins)
- **Product Catalog** (listings, attributes, categories)
- **Order Management** (checkout, tracking)
- **Payment Processing** (multiple gateways)
- **Analytics Dashboard** (seller insights)
- **Review System** (ratings, feedback)

### Technical Intake Context (Optional)

Provides technology-specific considerations:

```json
{
  "platform_targets": "Web, Mobile (iOS, Android)",
  "frontend_tech": "React, React Native",
  "backend_tech": "Laravel, Node.js microservices",
  "database_tech": "PostgreSQL, Redis",
  "ai_usage": "Product recommendations, Search",
  "external_services": "Stripe, SendGrid, AWS S3"
}
```

This helps AI:
- Suggest modules that align with tech stack
- Consider platform-specific requirements
- Account for external service integrations

### Existing Modules Context (Single Creation)

When adding a new module, AI receives the current module list:

```
1. User Management: Handles user registration, authentication...
2. Product Catalog: Manages product listings, categories...
3. Order Management: Processes orders, tracks fulfillment...
4. Payment Processing: Handles secure transactions...
```

This enables AI to:
- **Avoid duplication** - Don't suggest functionality that exists
- **Identify dependencies** - New module may depend on existing ones
- **Calculate proper order** - Where does this fit in build sequence?
- **Suggest integration points** - How will this connect with existing modules?

---

## Why This Approach?

### Problem: Modules are Foundational

Modules define the **bounded contexts** of your system. Getting them wrong cascades into:
- Poor feature organization
- Unclear responsibilities
- Technical debt
- Difficult refactoring later

### Alternative Approaches Considered

#### ❌ Approach 1: User Creates All Modules Manually

**Problems:**
- Requires DDD expertise
- Easy to miss important domains
- No guidance on dependencies
- Time-consuming for complex projects

#### ❌ Approach 2: AI Generates Everything at Once

**Problems:**
- No user control or input
- Can't incorporate domain knowledge
- All-or-nothing approach
- No iteration possible

#### ❌ Approach 3: Template-Based Modules

**Problems:**
- One-size-fits-all doesn't work
- Doesn't adapt to business domain
- May include irrelevant modules
- May miss domain-specific needs

### ✅ Our Approach: Guided AI Generation with User Control

**Benefits:**

| Benefit | How We Achieve It |
|---------|-------------------|
| **User Control** | User selects which suggestions to keep |
| **AI Intelligence** | DDD-based analysis of project domain |
| **Iteration** | Regenerate with feedback if needed |
| **Context Awareness** | Each stage builds on previous context |
| **Flexibility** | Add single modules later as needs evolve |
| **Quality Metrics** | AI suggests measurable KPIs per module |
| **Optimal Ordering** | AI determines build dependencies |

### The Two-Path Strategy

```
                    ┌─────────────────────┐
                    │   Project Created   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Has Modules?      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │   NO: New Project   │         │  YES: Existing      │
    │                     │         │      Project        │
    │   → Generate        │         │                     │
    │     Modules         │         │   → Add Module      │
    │     (Bulk Flow)     │         │     (Single Flow)   │
    └─────────────────────┘         └─────────────────────┘
```

**Why separate flows?**

1. **New projects** need comprehensive module discovery
   - AI should suggest the full architecture
   - User needs to see the big picture
   - Bulk enrichment is more efficient

2. **Existing projects** need targeted additions
   - Context of existing modules is crucial
   - User already knows what they need
   - Single module enrichment considers dependencies

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/modules/suggestion/generate` | POST | Generate initial module suggestions |
| `/v1/modules/suggestion/regenerate` | POST | Regenerate with user feedback |
| `/v1/modules/details/generate` | POST | Enrich selected modules (bulk) |
| `/v1/modules/single/generate` | POST | Create single module with context |

---

## Database Schema

### `modules` Table (Final Modules)

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| project_id | bigint | Foreign key to projects |
| name | string | Module name |
| description | text | Enhanced description |
| metrics | text | Business KPIs |
| erd | text | Entity relationship diagram (JSON) |
| status | enum | planned, in_progress, completed |
| order_of_implementation | integer | Build sequence order |

### `suggested_modules` Table (Cache)

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| project_id | bigint | Foreign key to projects |
| name | string | Suggested module name |
| description | text | Suggested description |
| metrics | text | Suggested metrics (if any) |
| order_of_implementation | integer | Suggested order |

**Note:** Suggested modules are deleted after user creates final modules.

---

## Best Practices

### For Users

1. **Write detailed project overviews** - More context = better suggestions
2. **Review all suggestions** - Don't just accept defaults
3. **Use regeneration wisely** - Provide specific, actionable feedback
4. **Add modules incrementally** - Better to add one good module than many vague ones

### For Developers

1. **Always include project overview** - It's the foundation of quality
2. **Pass existing modules for single creation** - Context prevents duplication
3. **Handle fallbacks gracefully** - If AI fails, create basic module
4. **Cache suggestions** - Avoid redundant API calls

---

## Example Scenarios

### Scenario 1: E-commerce Platform (New Project)

**Input:** Project overview describing online marketplace

**Generated Suggestions:**
1. Identity & Access Management
2. Product Catalog
3. Inventory Management
4. Shopping Cart
5. Order Processing
6. Payment Gateway Integration
7. Shipping & Fulfillment
8. Customer Support
9. Analytics & Reporting
10. Notification Service

**User Selection:** Keeps 1, 2, 4, 5, 6, 7, 10 (removes Inventory, Support, Analytics)

**Enriched Output:** Each module gets metrics like:
- "Cart abandonment rate < 30%"
- "Payment success rate > 98%"
- "Order processing time < 2 seconds"

### Scenario 2: Adding Real-time Chat (Existing Project)

**Existing Modules:** User Management, Product Catalog, Order Management

**User Input:**
- Name: "Real-time Messaging"
- Description: "Live chat between buyers and sellers for product inquiries"

**AI Context Analysis:**
- Depends on: User Management (for participants)
- Integrates with: Product Catalog (chat context)
- Should be built after: User Management, Product Catalog

**Enriched Output:**
- Enhanced description mentioning WebSocket, message persistence, typing indicators
- Metrics: "Message delivery rate > 99.9%", "Average response time < 5 minutes"
- Order: 4 (after User, Product, Order modules)
