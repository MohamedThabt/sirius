# Pricing & Usage System – Credit-Based Model

## Overview

This document explains the pricing approach, credit-based usage system, cost computation, user limiting strategies, profit margins, and database design for the **Sirius Pre-Code Planning Platform**.

The goal of this model is to:
- Ensure **predictable costs**
- Maintain **high profit margins**
- Provide **transparent and fair usage limits**
- Scale safely with AI-powered features

---

## 1. Credit-Based System

### What is a Credit?

- **1 Credit = 1,000 AI tokens**
- Tokens include both:
  - Input tokens (prompts, context, documents)
  - Output tokens (generated content)

Credits abstract away raw AI tokens so:
- Users don't deal with technical complexity
- Models can be changed later without breaking pricing
- Profit margins remain protected

---

## 2. Pricing Plan

### Standard Plan

| Plan | Price | Monthly Credits |
|------|-------|----------------|
| Pro  | $20 / month | **1,000 credits** |

This plan is designed for professional software engineers working on real-world projects.

---

## 3. How Laravel Computes Cost per Request

Each AI-powered request is processed by a dedicated **AI service (FastAPI)** which returns token usage:

```json
{
  "input_tokens": 8557,
  "output_tokens": 6192
}
```

### Cost Calculation Formula (Backend)

```php
$totalTokens = $inputTokens + $outputTokens;
$creditsUsed = ceil($totalTokens / 1000);

$costUsd =
    ($inputTokens / 1000 * INPUT_TOKEN_PRICE) +
    ($outputTokens / 1000 * OUTPUT_TOKEN_PRICE);
```

### Laravel Flow

1. User triggers an AI action
2. Laravel sends request to FastAPI
3. FastAPI returns token usage
4. Laravel:
   - Converts tokens → credits
   - Deducts credits from user balance
   - Logs usage for analytics & billing
5. Response is returned to the user

---

## 4. User Limiting Strategies

### ✅ Best Practice (Recommended)

A **Hard + Soft Limit Combined** approach.

| Limit Type | Behavior |
|------------|----------|
| Soft Limit | Warn user at 80% usage |
| Hard Limit | Block AI actions at 100% usage |
| Grace Buffer | Allow −50 credits once |

This approach:
- Prevents abuse
- Avoids sudden user frustration
- Encourages upgrades naturally

---

## 5. Pay-As-You-Go (Upsell Strategy)

When credits are exhausted, users can buy additional credits.

| Extra Credits | Price |
|---------------|-------|
| 250 credits   | $5    |

✅ This is a high-conversion upsell  
✅ No subscription change required  
✅ Ideal for heavy users or deadline pressure

---

## 6. What Actions Consume Credits?

Credits are charged based on **VALUE**, not API calls.

### Suggested Credit Costs

| Action | Credits |
|--------|---------|
| Project overview generation | 20 |
| PRD generation | 30 |
| SRS generation | 30 |
| User story decomposition | 10 |
| ERD generation | 15 |
| Sequence diagram | 10 |
| C4 diagram | 12 |
| Wireframe (text-based) | 15 |
| AI Code Prompt | 8 |
| Re-generate / refine | 50% of original |

### Important Rule

💡 **Mermaid, Markdown, and diagram rendering are FREE**

- AI thinking = paid
- Rendering = free

---

## 7. Profit Margin with All Tools Included

### Non-AI Tools (No Variable Cost)

- Mermaid diagrams
- Markdown documents
- ERD renderers
- Sequence diagrams
- C4 diagrams

👉 These tools are CPU-bound, not cost-bound.

### Real Cost Breakdown (Per User / Month)

| Item | Cost |
|------|------|
| AI usage | $3 – $4 |
| Hosting | $1 |
| Logs & storage | $0.50 |
| Monitoring | $0.50 |
| **Total Cost** | **~$6** |

### Revenue & Margin

- Revenue: $20
- Cost: ~$6
- Profit: ~$14

✅ **Profit Margin ≈ 70%**

This is a very healthy SaaS margin, even at scale.

---

## 8. Final Recommendation (TL;DR)

### ✔ Pricing

- $20 → 1,000 credits / month
- Extra credits: $5 → 250 credits

### ✔ Charging Model

- Charge per AI-generated artifact
- Rendering tools are always free

### ✔ Usage Limits

- Soft limit at 80%
- Hard limit at 100%
- Small grace buffer (−50 credits)

### ✔ Tracking

- Log tokens → convert to credits → deduct balance

---

## 9. Database Design

### 1️⃣ Users Table (Relevant Fields)

```sql
users
-----
id
plan_id
credits_balance
created_at
updated_at
```

### 2️⃣ Plans Table

```sql
plans
-----
id
name
monthly_price
monthly_credits
created_at
updated_at
```

### 3️⃣ Usage Logs Table

```sql
usage_logs
----------
id
user_id
action_type
input_tokens
output_tokens
credits_used
cost_usd
created_at
```

This table enables:
- Billing transparency
- Abuse detection
- Usage analytics
- Cost forecasting

---

## Conclusion

This pricing and usage system ensures:

- Fair pricing for users
- Predictable infrastructure costs
- Strong profit margins
- Long-term scalability

It is designed to support AI-heavy workflows without risking financial instability.

