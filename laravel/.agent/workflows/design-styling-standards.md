---
description: Design and styling standards for Sirius project (Tailwind v4 + Radix UI)
---

# Design & Styling Standards

These standards ensure consistency, accessibility, and a premium "Linear-like" aesthetic across the Sirius project.

## Table of Contents
1. [Tech Stack](#1-tech-stack)
2. [Core Principles](#2-core-principles)
3. [Theming & Colors](#3-theming--colors)
4. [Typography](#4-typography)
5. [Layout & Spacing](#5-layout--spacing)
6. [Component Construction](#6-component-construction)
7. [Animations & Motion](#7-animations--motion)
8. [Dark Mode](#8-dark-mode)
9. [Icons](#9-icons)
10. [Quick Reference](#10-quick-reference)

---

## 1. Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Tailwind CSS v4 |
| **Primitives** | Radix UI (Headless & Accessible) |
| **Variants** | `class-variance-authority` (CVA) |
| **Utilities** | `clsx` + `tailwind-merge` (`cn` helper) |
| **Icons** | Lucide React |
| **Animations** | `tailwindcss-animate` + Native CSS |

---

## 2. Core Principles

**Severity: 🔴 Critical**

### ✅ DO: Aim for "Premium & Dynamic"
- UI should feel "alive" with subtle micro-interactions.
- Use glassmorphism, subtle borders, and smooth gradients.
- Avoid flat, boring designs.

### ❌ DON'T: Use raw hex codes or inline styles
- Always use semantic semantic classes (e.g., `bg-primary`) or Tailwind utility classes.
- Never write `style={{ color: '#123456' }}`.

---

## 3. Theming & Colors

**Severity: 🔴 Critical**

The project uses semantic CSS variables defined in `@theme` and `:root`.

### ✅ DO: Use Semantic Color Names
Use these conceptual names to utilize the OKLCH color system automatically.

| Generic | Tailwind Class | Usage |
|---------|----------------|-------|
| **Primary** | `bg-primary`, `text-primary-foreground` | Main actions, buttons, active states |
| **Secondary** | `bg-secondary`, `text-secondary-foreground` | Less important actions, badges |
| **Muted** | `bg-muted`, `text-muted-foreground` | Backgrounds for lists, disabled text |
| **Accent** | `bg-accent`, `text-accent-foreground` | Hover states, dropdown items |
| **Destructive** | `bg-destructive`, `text-destructive-foreground` | Error states, delete actions |
| **Card** | `bg-card`, `text-card-foreground` | Card backgrounds (distinct from main bg) |
| **Border** | `border-border` | Default border color for inputs/cards |

### ❌ DON'T: Hardcode colors
```tsx
// BAD
<div className="bg-slate-900 text-white">

// GOOD
<div className="bg-card text-card-foreground">
```

---

## 4. Typography

**Severity: 🟡 Recommended**

### ✅ DO: Use Prose for Content
For user-generated content or markdown, use the `prose` class.
```tsx
<article className="prose dark:prose-invert">
  {content}
</article>
```

### ✅ DO: Use Semantic Text Sizes
- Headings: `text-2xl font-semibold tracking-tight`
- Body: `text-sm text-foreground`
- Muted: `text-sm text-muted-foreground`

---

## 5. Layout & Spacing

**Severity: 🟡 Recommended**

### ✅ DO: Use the 4px Grid System
Tailwind's numeric scale matches 4px increments (1 = 4px).
- `p-4` = 16px (Standard padding)
- `gap-2` = 8px (Tight grouping)
- `gap-6` = 24px (Section separation)

### ✅ DO: Use Container Components
Don't reinvent containers. Use standard max-widths.
```tsx
<div className="container mx-auto max-w-7xl px-4">
```

---

## 6. Component Construction

**Severity: 🔴 Critical**

### ✅ DO: Use `cn()` for Class Merging
Always use the `cn` utility allows external classes to override defaults.
```tsx
import { cn } from "@/lib/utils";

export function Card({ className, children }: ComponentProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}
```

### ✅ DO: Use CVA for Variants
For components with multiple visual styles (buttons, badges), use `cva`.
```tsx
const badgeVariants = cva(
  "inline-flexitems-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### ✅ DO: Reuse UI Primitives
Never build a button or input from scratch. Use `@/components/ui/*`.
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

---

## 7. Animations & Motion

**Severity: 🟢 Optional**

The `app.css` defines several custom animations for a premium feel.

### ✅ DO: Use Custom Animations
- `animate-float`: Gentle vertical floating (hero elements)
- `animate-pulse-border`: Subtle border highlight
- `animate-slide-up`: Entry animation
- `animate-fade-in`: Simple fade entry

### ✅ DO: Add Hover Micro-interactions
```tsx
<div className="transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md">
```

---

## 8. Dark Mode

**Severity: 🔴 Critical**

### ✅ DO: Test in Dark Mode
All components must look good in both modes.
- Use `bg-background` and `text-foreground` which auto-switch.
- Use `dark:` modifier for specific overrides ONLY if semantic colors fail.

### ❌ DON'T: Ignore Dark Mode
- White text on a white background is a common bug. Always verify specific text colors against their background.

---

## 9. Icons

**Severity: 🟡 Recommended**

### ✅ DO: Use Lucide React
Consistency in iconography is key. Use Lucide icons with appropriate sizing.
```tsx
import { Activity, Settings } from 'lucide-react';

<Activity className="size-4 text-muted-foreground" />
<Settings className="mr-2 size-4" />
```

### ✅ DO: Consistent Icon Sizing
- Small/Inline: `size-4` (16px)
- Button Icon: `size-4`
- Feature Icon: `size-6` or `size-8`

---

## 10. Quick Reference

### Common Patterns

| Use Case | Pattern |
|----------|---------|
| **Card** | `rounded-lg border bg-card text-card-foreground shadow-sm` |
| **Page Header** | `flex items-center justify-between space-y-2` |
| **Section Title** | `text-2xl font-bold tracking-tight` |
| **Subtitle** | `text-muted-foreground` |
| **Divider** | `border-t bg-muted` (use `<Separator />`) |
| **Focus Ring** | `focus-visible:ring-2 focus-visible:ring-ring` |

### Location Reference
- **UI Components**: `resources/js/components/ui`
- **Global CSS**: `resources/css/app.css`
- **Utils**: `resources/js/lib/utils.ts`
