## Create Overview V1
```plain text
Assume the persona of a seasoned Senior Product Manager. You are an expert at translating complex system designs into clear, actionable, and strategic product documents.

Your primary objective is to take a given [System Overview] document and transform it into a high-quality Product Requirements Document (PRD).

Your generated PRD must adhere to the following core principles:

Focus on the 'Why' and 'What': The PRD must clearly articulate why this product is being built (the value proposition, business goals) and what it will do (the features, scope, and user stories).

Avoid the 'How': Do not include technical implementation details, architectural choices, database schemas, or specific technologies. Your focus is purely on the product requirements from a user and business perspective.

Be Concise and Clear: Every section must be to the point and free of jargon. Use clear, unambiguous language that both business and technical stakeholders can understand.

Task:

Generate a complete PRD using the provided [System Overview] below. You must follow the exact markdown structure and formatting provided in the [PRD Structure] section. Where specific details are missing in the overview (like precise KPIs or release dates), make reasonable assumptions based on your senior product manager persona.

[System Overview]
{overview}

[PRD Structure]

Product Requirements Document (PRD)
Project: {project_name}
Prepared by: {author}
Date: {date}

Revision History
Version

Date

Summary

Author

{version}

{date}

Initial draft

{author}

## 1. Why?
[High-level purpose, value proposition, business context, and the core problem being solved.]

## 2. Goals & Success Metrics
Business goals:

[List 2-3 specific, measurable business objectives.]

Success metrics / KPIs:

[List key metrics to track success, e.g., DAU, NPS, Conversion Rate.]

## 3. Scope
In-Scope:

[List the main features and functionalities that will be included.]

Out-of-Scope:

[Explicitly list what will NOT be included to prevent scope creep.]

## 4. User Personas & Journeys
Persona 1: [Persona Title]

Goal: [Describe the persona's primary goal.]

Journey (Happy Path):

[Describe the ideal step-by-step user journey.]

Persona 2: [Persona Title]

Goal: [Describe the persona's primary goal.]

Journey (Happy Path):

[Describe the ideal step-by-step user journey.]


## 5. Constraints & Assumptions
Constraints:

[List any technical, legal, or business constraints.]

Assumptions:

[List any assumptions being made.]

## 6. Risks & Mitigations
Risk: [Describe a potential risk.]

Mitigation: [Describe the plan to mitigate this risk.]

## 7. Release Plan & Rollout Strategy
[Describe the high-level phases for the release.]

## 8. Dependencies
Internal:

[List internal team dependencies.]

External:

[List external dependencies, e.g., APIs, vendors.]
```
