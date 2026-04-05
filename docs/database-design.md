# Database Design Documentation

## Overview

This document outlines the database design for the Sirius application, which manages users and their projects. The design follows Laravel conventions and includes proper relationships, indexes, and data types.

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar name
        varchar email UK
        timestamp email_verified_at
        varchar password
        varchar remember_token
        timestamp created_at
        timestamp updated_at
    }

    PROJECTS {
        bigint id PK
        varchar name
        text brief
        longtext non_functional_requirements
        longtext technical_details
        enum type
        enum status
        longtext erd
        longtext sequence_diagram
        longtext wireframe
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_USER {
        bigint id PK
        bigint user_id FK
        bigint project_id FK
        enum role
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_OVERVIEW_VERSIONS {
        bigint id PK
        bigint project_id FK
        longtext overview
        integer version_number
        text description
        boolean is_base_version
        text user_prompt
        timestamp created_at
        timestamp updated_at
    }

    FEATURES {
        bigint id PK
        bigint project_id FK
        <!-- from to -->
        varchar name
        varchar Summary
        varchar Priority
        longtext acceptance_criteria:
        integer Order_of_Implementation
        longtext acceptance_criteria
        varchar user_flows [user journey]
        longtext Metrics
        longtext description
        <!-- here -->
        longtext erd
        longtext sequence_diagram
        longtext wirefrram
        timestamp created_at
        timestamp updated_at
    }

    PROMPTS {
        bigint id PK
        varchar name
        enum phase
        enum project_type
        enum output_type
        longtext template
        longtext system_message
        longtext user_message_template
        json variables
        json validation_rules
        enum ai_model
        integer max_tokens
        float temperature
        boolean is_active
        varchar version
        longtext description
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    USERS ||--o{ PROJECT_USER : "belongs to many"
    PROJECTS ||--o{ PROJECT_USER : "belongs to many"
    PROJECTS ||--o{ PROJECT_OVERVIEW_VERSIONS : "has many"
    PROJECTS ||--o{ FEATURES : "has many"
    USERS ||--o{ PROJECT_OVERVIEW_VERSIONS : "creates"

```

## Table Descriptions

### USERS

Standard Laravel users table with authentication fields.

### PROJECTS

Enhanced projects table with additional design documentation fields:

- **erd**: Entity Relationship Diagram content (longtext)
- **sequence_diagram**: Sequence diagram content (longtext)
- **wireframe**: Wireframe design content (longtext)

Note: Project overviews are now managed through the PROJECT_OVERVIEW_VERSIONS table for version control.

### PROJECT_USER (Pivot Table)

Many-to-many relationship between users and projects with role-based access:

- **role**: User role in the project (enum: 'owner', 'admin', 'developer', 'viewer', etc.)

### PROJECT_OVERVIEW_VERSIONS

Version-controlled project overview management with AI editing support:

- **overview**: Project overview content (longtext)
- **version_number**: Numeric version identifier (integer)
- **description**: Version description and changes (text)
- **is_base_version**: Boolean flag indicating if this is the primary/base version for the project
- **user_prompt**: User's prompt for AI editing of this version (text, nullable)
- **created_by**: User who created this version (FK to users table)

### FEATURES

Comprehensive feature management table for project requirements:

- **technical_details**: Technical implementation details
- **user_story**: User story description
- **priority**: Feature priority (enum: 'low', 'medium', 'high', 'critical')
- **story_points**: Agile story points for estimation
- **acceptance_criteria**: Feature acceptance criteria (longtext)
- **description**: Detailed feature description (longtext)
- **business_goal**: Business objective for the feature
- **erd**: Feature-specific ERD content (longtext)
- **sequence_diagram**: Feature-specific sequence diagram (longtext)
- **code_generator_prompt**: AI code generation prompt (longtext)

### PROMPTS

Comprehensive prompt management system for AI-driven content generation:

- **name**: Human-readable prompt name/identifier
- **phase**: Development phase (enum: 'planning', 'analysis', 'design', 'implementation', 'testing', 'deployment')
- **project_type**: Project category (enum: 'web_app', 'mobile_app', 'api', 'desktop_app', 'microservice', 'full_stack')
- **output_type**: Expected output format (enum: 'overview', 'prd', 'srs', 'user_story', 'erd', 'sequence_diagram', 'wireframe', 'code', 'technical_spec')
- **template**: Base prompt template with placeholders (longtext)
- **system_message**: AI system/role instructions (longtext)
- **user_message_template**: User message template with variables (longtext)
- **variables**: JSON schema of required variables and their types
- **validation_rules**: JSON rules for validating prompt inputs
- **ai_model**: Target AI model (enum: 'gpt-4', 'gpt-3.5-turbo', 'claude-3', 'custom')
- **max_tokens**: Maximum response tokens
- **temperature**: AI creativity/randomness setting (0.0-1.0)
- **is_active**: Whether prompt is currently usable
- **version**: Prompt version for tracking changes
- **description**: Purpose and usage description (longtext)
- **created_by**: User who created the prompt

## Relationships

1. **Users ↔ Projects**: Many-to-many relationship through `project_user` pivot table with roles
2. **Projects → Project Overview Versions**: One-to-many relationship where each project can have multiple overview versions
3. **Users → Project Overview Versions**: One-to-many relationship where users can create and manage overview versions
4. **Projects → Features**: One-to-many relationship where each project can have multiple features
5. **Users → Prompts**: One-to-many relationship where users can create and manage prompts
