# 📌 Project Context Extraction Feature Documentation

## 🧠 Overview

This feature is an **AI-powered pipeline** that extracts structured
"Project Context" information from free-form user input and generates
intelligent clarifying questions for missing fields.

The system is built using a **two-layer architecture**:

1.  **Extraction Layer (Gemini via proxy)** → Extracts structured JSON
2.  **Reasoning Layer (LLM)** → Generates clarifying questions for
    missing required fields

------------------------------------------------------------------------

# ⚙️ Architecture

## 1. Extraction Layer

### Function

``` python
extract_project_context_async(text: str)
```

### Purpose

Converts raw user input into a structured `ProjectContext` object.

------------------------------------------------------------------------

### Output Schema

``` json
{
  "project_purpose": "string | null",
  "target_audience": ["string"],
  "value_proposition": "string | null",
  "features": ["string"],
  "platforms": ["string"],
  "constraints": ["string"],
  "integrations": ["string"]
}
```

------------------------------------------------------------------------

### Core Rules

-   ❌ Do NOT invent features, ideas, or business logic
-   ❌ Do NOT use external knowledge
-   ✅ Only extract explicitly stated or strongly implied information
-   ❌ If uncertain → return `null` or `[]`

------------------------------------------------------------------------

### Grounded Inference Rule

Light inference is allowed only when directly implied:

Example: - Input: `"app for students"` - Output:

``` json
{
  "target_audience": ["students"]
}
```

------------------------------------------------------------------------

## 2. Reasoning Layer

### Class

``` python
ReasoningChain
```

------------------------------------------------------------------------

### Purpose

Analyzes extracted context and generates clarifying questions for
missing required fields.

------------------------------------------------------------------------

### Required Fields

    project_purpose
    target_audience
    value_proposition
    features
    platforms
    integrations

------------------------------------------------------------------------

### Output Schema

``` json
{
  "missing_fields": ["features", "integrations"],
  "questions": [
    {
      "field": "features",
      "question": "What features do you want in your application?",
      "suggested_answers": [
        "Chat system",
        "Notifications",
        "User profiles"
      ]
    }
  ],
  "summary_confidence": 0.0
}
```

------------------------------------------------------------------------

### Rules

-   ❌ Do NOT introduce new features or assumptions
-   ❌ Do NOT use external knowledge
-   ✅ Base questions ONLY on extracted context + user input
-   Each missing required field → one question

------------------------------------------------------------------------

# 🔗 LangGraph Node

## Function

``` python
extract_project_context_node(state: dict)
```

## Output

``` json
{
  "project_context": { }
}
```

------------------------------------------------------------------------

## Behavior

-   Extracts input text from state
-   Runs extraction pipeline
-   Returns structured `ProjectContext`
-   Returns `null` if extraction fails

------------------------------------------------------------------------

# 🌐 API Endpoint

## Endpoint

POST /extract-project-context

------------------------------------------------------------------------

## Request

``` json
{
  "text": "An E-Learning Platform is a digital solution designed to help students learn anytime and anywhere through interactive online content. The system provides a structured learning experience where users can access courses, videos, quizzes, and study materials in a flexible and personalized way. The platform allows students to register and create their own profiles, track their progress, and continue learning at their own pace. It offers a wide range of courses across different subjects, each divided into modules for better understanding. Instructors can upload educational content, assignments, and assessments to evaluate student performance. Key features include interactive quizzes, progress tracking, course recommendations based on user interests, and discussion forums to encourage communication between students and instructors. The system also supports notifications to remind learners about deadlines, new lessons, or upcoming exams. Overall, the E-Learning Platform aims to make education more accessible, engaging, and efficient by combining technology with modern teaching methods."
}
```

------------------------------------------------------------------------

## Response Example

``` json
{
  "project_context": {
    "project_purpose": "Provide a digital solution for students to learn anytime and anywhere through interactive online content.",
    "target_audience": [
      "students",
      "instructors",
      "learners"
    ],
    "value_proposition": "Offers a structured, flexible, and personalized learning experience, enabling students to learn at their own pace and making education more accessible, engaging, and efficient.",
    "features": [
      "Access courses",
      "Access videos",
      "Access quizzes",
      "Access study materials",
      "User registration",
      "User profile creation",
      "Progress tracking",
      "Self-paced learning",
      "Wide range of courses across different subjects",
      "Course content divided into modules",
      "Instructor content upload (educational content, assignments, assessments)",
      "Interactive quizzes",
      "Course recommendations based on user interests",
      "Discussion forums",
      "Notifications (for deadlines, new lessons, upcoming exams)"
    ],
    "platforms": [],
    "constraints": [],
    "integrations": []
  },
  "ai_questions": {
    "missing_fields": [
      "platforms",
      "integrations"
    ],
    "questions": [
      {
        "field": "platforms",
        "question": "On which platforms should the E-Learning Platform be accessible?",
        "suggested_answers": [
          "Web browser (desktop and mobile responsive)",
          "Dedicated mobile app (iOS and Android)",
          "Desktop application"
        ]
      },
      {
        "field": "integrations",
        "question": "Are there any external systems or services that the E-Learning Platform needs to connect with?",
        "suggested_answers": [
          "Payment gateway for course purchases",
          "Single Sign-On (SSO) with existing university/school systems",
          "Third-party analytics tools for tracking user engagement"
        ]
      }
    ],
    "summary_confidence": 0.85
  },
  "usage": {
    "model_name": "gem2.5f",
    "input_tokens": 1034,
    "output_tokens": 3160,
    "cost": 0
  }
}
```
