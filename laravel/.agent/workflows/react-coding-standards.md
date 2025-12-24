---
description: React + Inertia.js coding standards for Sirius project pages
---

# React + Inertia.js Coding Standards

These rules apply to all React page components in the Sirius project.

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Type Definitions](#2-type-definitions)
3. [Component Size](#3-component-size)
4. [Custom Hooks](#4-custom-hooks)
5. [Inertia.js Patterns](#5-inertiajs-patterns)
6. [Form Handling](#6-form-handling)
7. [State Management](#7-state-management)
8. [Memoization](#8-memoization)
9. [ReactMarkdown Code Blocks](#9-reactmarkdown-code-blocks)
10. [Component Imports](#10-component-imports)
11. [Error & Loading States](#11-error--loading-states)
12. [Performance](#12-performance)
13. [Comments](#13-comments)
14. [File Organization](#14-file-organization)
15. [Testing Guidelines](#15-testing-guidelines)
16. [Quick Reference](#16-quick-reference)

---

## 1. Project Overview

| Aspect | Technology |
|--------|------------|
| Framework | React 18+ with Inertia.js 2.x |
| Backend | Laravel 11 |
| Routing | Wayfinder (type-safe routes) |
| Styling | CSS with component-scoped styles |
| State | Inertia props + React local state |

---

## 2. Type Definitions

**Severity: 🔴 Critical**

### ✅ DO: Use shared types from `@/types`
```typescript
import { type Project, type Sections, type User } from '@/types';
```

### ❌ DON'T: Define duplicate interfaces in each file
```typescript
// BAD - duplicated in every file
interface Project {
    id: number;
    name: string;
    // ...repeated fields
}
```

**WHY**: Shared types prevent sync issues when the backend model changes.

---

## 3. Component Size

**Severity: 🟡 Recommended**

### ✅ DO: Keep page components under 400 lines
- Extract reusable UI into `@/components/`
- Extract business logic into custom hooks
- Split large forms into step components

### ❌ DON'T: Create 1000+ line components
- Each step/section should be its own component
- Large components are hard to test and maintain

---

## 4. Custom Hooks

**Severity: 🟡 Recommended**

### ✅ DO: Extract common patterns into hooks
```typescript
// Existing hooks to use:
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useResizablePanel } from '@/hooks/use-resizable-panel';
import { useIsDarkMode } from '@/hooks/use-theme-detection';
```

### ❌ DON'T: Duplicate logic across components
- If you find yourself copying 10+ lines, extract a hook

---

## 5. Inertia.js Patterns

**Severity: 🔴 Critical**

### ✅ DO: Use Inertia router for all server requests
```typescript
import { router } from '@inertiajs/react';

router.post('/endpoint', data, {
    preserveScroll: true,
    onSuccess: () => { ... },
    onError: (errors) => { ... },
});
```

### ✅ DO: Use Wayfinder for type-safe routes
```typescript
import { projects } from '@/routes';

// Type-safe navigation
router.visit(projects.show({ project: id }));
```

### ❌ DON'T: Use manual fetch with CSRF extraction
```typescript
// BAD - manually extracting CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')...
await fetch('/endpoint', {
    headers: { 'X-CSRF-TOKEN': csrfToken }
});
```

**WHY**: Inertia handles CSRF automatically. Manual fetch breaks the SPA navigation model.

---

## 6. Form Handling

**Severity: 🔴 Critical**

### ✅ DO: Use Inertia's `useForm` hook
```typescript
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
});

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/submit', {
        onSuccess: () => reset(),
    });
};
```

### ✅ DO: Display validation errors
```typescript
<input
    value={data.email}
    onChange={e => setData('email', e.target.value)}
/>
{errors.email && <span className="error">{errors.email}</span>}
```

### ❌ DON'T: Manage form state manually with useState
```typescript
// BAD - unnecessary boilerplate
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [errors, setErrors] = useState({});
```

---

## 7. State Management

**Severity: 🟡 Recommended**

### ✅ DO: Prefer server state via Inertia props
```typescript
// Props come from Laravel controller
export default function Show({ project, user }: Props) {
    // Use props directly - no need to copy to state
    return <div>{project.name}</div>;
}
```

### ✅ DO: Use local state only for UI concerns
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

### ❌ DON'T: Duplicate server state in local useState
```typescript
// BAD - creates sync issues
const [project, setProject] = useState(props.project);
```

---

## 8. Memoization

**Severity: 🟢 Optional**

### ✅ DO: Use useMemo for expensive computations
```typescript
const stats = useMemo(() => {
    return projects.reduce((acc, p) => { ... });
}, [projects]);
```

### ✅ DO: Use useCallback for handlers passed to children
```typescript
const handleSubmit = useCallback((data) => {
    router.post('/submit', data);
}, []);
```

### ❌ DON'T: Memoize everything
- Simple values and inline handlers don't need memoization
- Only memoize when there's measurable re-render cost

---

## 9. ReactMarkdown Code Blocks

**Severity: 🔴 Critical**

### ✅ DO: Detect inline code via className
```typescript
code: ({ className, children, ...props }) => {
    const isInline = !className;
    // ...
}
```

### ❌ DON'T: Use deprecated `inline` prop
```typescript
// BAD - deprecated in react-markdown v9
code({ inline, className, children }) { ... }
```

---

## 10. Component Imports

**Severity: 🟡 Recommended**

### ✅ DO: Import shared components
```typescript
import { ChatInput } from '@/components/Chat/ChatInput';
import { MermaidDiagram } from '@/components/MermaidDiagram';
```

### ❌ DON'T: Define inline components in page files
- If a component is used in 2+ places, extract it
- Page files should focus on layout and data flow

---

## 11. Error & Loading States

**Severity: 🔴 Critical**

### ✅ DO: Always handle loading, error, and empty states
```typescript
{isLoading && <Skeleton />}
{error && <ErrorMessage message={error} />}
{data.length === 0 && <EmptyState />}
{data.length > 0 && <DataList items={data} />}
```

### ❌ DON'T: Assume data is always present

---

## 12. Performance

**Severity: 🟡 Recommended**

### ✅ DO: Use React.lazy for heavy components
```typescript
const MermaidDiagram = React.lazy(() => import('@/components/MermaidDiagram'));
```

### ✅ DO: Use preserveState/preserveScroll when appropriate
```typescript
router.post('/update', data, {
    preserveState: true,  // Keep local component state
    preserveScroll: true, // Don't jump to top
});
```

### ❌ DON'T: Create inline objects/arrays in JSX
```typescript
// BAD - creates new reference every render
<Component style={{ color: 'red' }} items={[1, 2, 3]} />

// GOOD - stable references
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} items={items} />
```

---

## 13. Comments

**Severity: 🟢 Optional**

### ✅ DO: Add WHY comments for non-obvious decisions
```typescript
// WHY: Using useEffect instead of useMemo because we need to trigger a side effect
useEffect(() => {
    setSearchedUser(initialSearchedUser);
}, [initialSearchedUser]);
```

### ❌ DON'T: Comment obvious code
```typescript
// BAD: This increments the counter
counter++;
```

---

## 14. File Organization

**Severity: 🟡 Recommended**

```
pages/Projects/
├── Index.tsx           # List view
├── Show.tsx            # Detail view
├── Create.tsx          # Creation form
├── components/         # Page-specific components
│   └── ProjectCard.tsx
└── hooks/              # Page-specific hooks
    └── useProjectForm.ts
```

---

## 15. Testing Guidelines

**Severity: 🟢 Optional**

| Test Type | Tool | Purpose |
|-----------|------|---------|
| Unit | Vitest | Hooks, utilities |
| Component | React Testing Library | UI interactions |
| E2E | Playwright | Full user flows |

### ✅ DO: Test user behavior, not implementation
```typescript
// GOOD - tests what user sees
expect(screen.getByText('Save')).toBeDisabled();

// BAD - tests implementation details
expect(component.state.isDisabled).toBe(true);
```

---

## 16. Quick Reference

### Shared Types (`@/types/index.d.ts`)
| Type | Description |
|------|-------------|
| `User` | Current authenticated user |
| `Project` | Core project entity |
| `Sections` | Project documentation status |
| `OverviewVersion` | System overview versions |
| `PRDVersion` | PRD versions |
| `ChatMessage` | AI chat message structure |

### Shared Components
| Component | Path | Purpose |
|-----------|------|---------|
| `ChatInput` | `@/components/Chat/ChatInput` | AI prompt input |
| `MermaidDiagram` | `@/components/MermaidDiagram` | Mermaid renderer |
| `ProjectSidebarPanel` | `@/components/...` | Project navigation |
| `SidebarToggle` | `@/components/...` | Sidebar collapse button |

### Shared Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useFlashToasts` | `@/hooks/use-flash-toasts` | Flash message handling |
| `useResizablePanel` | `@/hooks/use-resizable-panel` | Resizable panels |
| `useIsDarkMode` | `@/hooks/use-theme-detection` | Theme detection |

---

## ESLint Enforcement

Many of these rules can be enforced via ESLint:
- `@typescript-eslint/consistent-type-imports` - Enforce type imports
- `react-hooks/exhaustive-deps` - Catch missing dependencies
- `react/jsx-no-constructed-context-values` - Prevent inline objects

