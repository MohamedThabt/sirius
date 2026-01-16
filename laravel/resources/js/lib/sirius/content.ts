import { FileText, GitBranch, Users, Zap, Shield, Database, Code, Workflow, Brain, Layout, Server, Lock, Gauge, Accessibility, CloudCog, GitMerge, ClipboardList, UsersRound, Shapes, Blocks, ScrollText, RefreshCw, AlertTriangle, Layers, TrendingUp } from "lucide-react";

export const heroContent = {
  badge: "Beta Access",
  title: "Build-ready specs",
  titleHighlight: "for engineering teams",
  subtitle: "Paste your project brief and Sirius AI breaks it into features with complete PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports everything to GitHub.",
  primaryCta: "Request Early Access",
  secondaryCta: "See How It Works",
  valueProps: [
    "Project brief → Complete documentation",
    "Unified ERD & sequence diagrams",
    "One-click GitHub export",
  ],
};

export const problemSolution = {
  eyebrow: "The Problem",
  title: "Documentation shouldn't slow you down",
  problems: [
    {
      icon: FileText,
      title: "Manual PRD Creation",
      description: "Hours spent writing and formatting requirements documents that quickly become outdated.",
    },
    {
      icon: GitBranch,
      title: "Fragmented Documentation",
      description: "Scattered docs across wikis, tickets, and repos. No single source of truth.",
    },
    {
      icon: Users,
      title: "Team Misalignment",
      description: "Stakeholders interpret requirements differently, leading to costly rework.",
    },
  ],
  solutionTitle: "Sirius automates your pre-code phase",
  solutionDescription: "Input a project brief. Get a structured documentation suite—PRDs, SRSs, ERDs, and wireframes ready for development.",
};

export const howItWorks = {
  eyebrow: "How It Works",
  title: "From brief to build-ready in minutes",
  steps: [
    {
      id: "FR-001",
      badge: "Project Brief",
      label: "Step 1",
      title: "Define your project",
      description: "Fill in a structured brief covering purpose, audience, core features, and technical preferences. Sirius uses this as the foundation for everything that follows.",
    },
    {
      id: "FR-002",
      badge: "System Overview",
      label: "Step 2",
      title: "Generate overview & SRS",
      description: "Sirius AI analyzes your brief and generates a comprehensive System Overview and Software Requirements Specification automatically.",
    },
    {
      id: "FR-003",
      badge: "Modules",
      label: "Step 3",
      title: "Break into modules",
      description: "Your project is decomposed into DDD-style bounded contexts. Each module gets AI-generated ERDs and can be refined with your feedback.",
    },
    {
      id: "FR-004",
      badge: "Features & Artifacts",
      label: "Step 4",
      title: "Generate feature artifacts",
      description: "Each module expands into features with complete documentation: data models, sequence diagrams, wireframes, and technical specs.",
    },
    {
      id: "FR-005",
      badge: "GitHub Export",
      label: "Step 5",
      title: "Export to GitHub",
      description: "Push your entire documentation suite—PRDs, specs, ERDs, and diagrams—to GitHub with a single click, keeping everything in sync.",
    },
  ],
};

export const teamCollaboration = {
  eyebrow: "Who It's For",
  title: "Built for teams who ship",
  description: "Whether you're a solo developer or an enterprise team, Sirius accelerates your pre-code phase.",
  roles: [
    {
      role: "Solo Developers",
      description: "Stop spending days on documentation. Generate complete specs from your project idea and focus on what you love—building.",
      responsibilities: ["Generate PRDs in minutes", "Auto-create ERDs & diagrams", "Export to GitHub instantly"],
    },
    {
      role: "Startups",
      description: "Move fast without breaking things. Get investor-ready documentation and align your team from day one.",
      responsibilities: ["Pitch-ready PRDs", "Scale docs as you grow", "Onboard devs faster"],
    },
    {
      role: "Agencies",
      description: "Standardize client deliverables. Generate consistent documentation across all projects and impress clients with professional specs.",
      responsibilities: ["Consistent doc templates", "Client-ready exports", "Multi-project management"],
    },
    {
      role: "Product Managers",
      description: "Bridge the gap between business and engineering. Create clear, unambiguous requirements that developers actually understand.",
      responsibilities: ["Visual user flows", "Acceptance criteria", "Stakeholder alignment"],
    },
  ],
  useCases: [
    { name: "Planning an MVP", icon: Zap },
    { name: "Designing SaaS Architecture", icon: Server },
    { name: "Client Documentation", icon: FileText },
    { name: "AI Agent Systems", icon: Brain },
    { name: "API-First Design", icon: CloudCog },
    { name: "Microservices Planning", icon: Database },
  ],
};

export const documentationSuite = {
  eyebrow: "Complete Documentation Suite",
  title: "Brief to build-ready docs, versioned and complete.",
  features: [
    {
      title: "PRDs & Specs",
      description: "Transform project briefs into investor-ready PRDs and formal Software Requirements Specifications. Get complete scope, requirements, data models, and traceability matrices—all versioned and maintained as your single source of truth.",
      icon: FileText,
    },
    {
      title: "Brainstorming",
      description: "Kickstart projects with AI-powered ideation and Excalidraw integration for visual sketching. Explore feature concepts, validate assumptions, and refine your vision before committing to formal specs—turning rough ideas into structured, actionable requirements.",
      icon: Brain,
    },
    {
      title: "Modules & Features",
      description: "Break projects into prioritized, implementation-ready user stories. Sirius generates and expands feature ideas, adds acceptance criteria, user flows, and metrics, and applies prioritization frameworks to keep backlogs focused.",
      icon: Blocks,
    },
    {
      title: "Team Sync",
      description: "Built-in role-based access control, real-time updates, and commenting keep engineers, architects, and stakeholders aligned. Track changes, approve specs, and maintain a single source of truth across your entire team.",
      icon: RefreshCw,
    },
    {
      title: "ERDs & Diagrams",
      description: "Automatically generate module- and feature-level ERDs that roll up into a unified, project-wide data model, plus sequence diagrams that visualize component interactions for each user story—all using validated Mermaid syntax that can be safely regenerated as the system evolves.",
      icon: Shapes,
    },
    {
      title: "GitHub Export",
      description: "Generate structured technical specs with architecture views, integration points, edge cases, and performance requirements—then export directly to GitHub as markdown files, organized by feature and ready to plug into your delivery process.",
      icon: GitBranch,
    },
  ],
};



export const specDrivenDevelopment = {
  eyebrow: "The Pre-Code Problem",
  title: "Great software starts before the first line of code",
  
  problem: {
    title: "What's killing your velocity",
    description: "Every engineering team faces the same bottleneck: the chaos between idea and implementation.",
    painPoints: [
      {
        title: "Documentation takes weeks, not minutes",
        description: "Writing PRDs, specs, and ERDs manually burns engineering time. By the time docs are done, requirements have already changed.",
        icon: FileText,
      },
      {
        title: "Requirements live in 10 different places",
        description: "Slack threads, Notion pages, Jira tickets, email chains. No single source of truth means everyone interprets specs differently.",
        icon: Layers,
      },
      {
        title: "Devs and PMs speak different languages",
        description: "Product thinks in features. Engineering thinks in systems. The translation gap causes rework, scope creep, and missed deadlines.",
        icon: Users,
      },
      {
        title: "Vibe coding doesn't scale",
        description: "Prompting AI to 'just build it' works for demos—not production. Without specs, you get code that compiles but breaks under real-world load.",
        icon: AlertTriangle,
      },
    ],
  },
  
  solution: {
    title: "Specification-driven development, powered by AI",
    description: "Sirius transforms unstructured project ideas into complete, structured documentation—PRDs, ERDs, user stories, sequence diagrams, and wireframes—all connected and export-ready.",
    steps: [
      {
        step: "1",
        title: "Describe your project",
        description: "Paste your idea, brief, or requirements. No templates, no forms—just tell Sirius what you're building.",
      },
      {
        step: "2",
        title: "AI generates your documentation suite",
        description: "System overview, PRD, modules, features, ERDs, sequence diagrams, and wireframes—all structured, all connected.",
      },
      {
        step: "3",
        title: "Refine, export, build",
        description: "Edit with AI assistance, sync to GitHub, and hand off specs that feed AI code generators with the context they actually need.",
      },
    ],
    contrast: "Vibe coding breaks in production. Specification-driven development doesn't. Sirius gives you the specs that make AI-generated code production-ready.",
  },
};

export const faqItems = [
  {
    question: "Who is Sirius for?",
    answer: "Sirius is built for software engineers, team leads, product managers, and technical teams who want to eliminate the friction of pre-code documentation. Whether you're a solo developer at a startup or managing an enterprise team, Sirius helps you move from idea to implementation faster.",
  },
  {
    question: "How does Sirius use AI to generate documentation?",
    answer: "Sirius uses large language models to transform your project brief into structured documentation. It analyzes your requirements and automatically generates PRDs (Product Requirements Documents), SRS (Software Requirements Specifications), user stories with acceptance criteria, ERDs (Entity Relationship Diagrams), sequence diagrams, and wireframes—all in minutes instead of days.",
  },
  {
    question: "Can Sirius generate a PRD from just a project description?",
    answer: "Yes! Simply paste your project description or idea, and Sirius AI will generate a complete PRD including scope, features, user stories, and technical requirements. You can then refine and iterate on the generated documentation with AI assistance.",
  },
  {
    question: "How is Sirius different from writing documentation manually?",
    answer: "Manual documentation takes days or weeks and quickly becomes outdated. Sirius generates comprehensive, consistent documentation in minutes. It maintains relationships between your PRD, ERDs, and user stories automatically, and keeps everything in sync as your project evolves.",
  },
  {
    question: "Does Sirius work for complex enterprise systems?",
    answer: "Absolutely. Sirius breaks down complex projects into DDD-style bounded contexts (modules), each with their own ERDs and features. This modular approach scales from simple MVPs to complex enterprise architectures with multiple integrated systems.",
  },
  {
    question: "Can I use Sirius with existing projects?",
    answer: "Yes. You can import an existing project brief or describe your current system, and Sirius will generate the documentation suite. It's perfect for teams who need to document legacy systems or standardize their existing project documentation.",
  },
  {
    question: "How does Sirius integrate with GitHub?",
    answer: "Sirius exports your entire documentation suite—PRDs, SRS, ERDs, sequence diagrams, and technical specs—directly to a GitHub repository with one click. Documentation is organized by module and feature, keeping your repo as the single source of truth.",
  },
  {
    question: "Does Sirius work with AI code generators like Cursor or Copilot?",
    answer: "Yes! Sirius documentation is specifically designed to feed AI code generators. The structured PRDs, ERDs, and technical specs provide the context AI assistants need to generate accurate, requirement-compliant code. Think of Sirius as the 'pre-code' phase that supercharges your AI development workflow.",
  },
  {
    question: "How is my data secured?",
    answer: "All data is encrypted with AES-256 at rest and in transit. We follow industry best practices for security, maintain SOC 2 compliance standards, and your project data is never used to train AI models.",
  },
  {
    question: "Is there a free tier or trial available?",
    answer: "We're currently in closed beta with limited seats for engineering teams. Request early access to be among the first to try Sirius. Beta users get extended free access and help shape the product roadmap.",
  },
];

export const ctaContent = {
  headline: "Ready to ship faster?",
  body: "Join the closed beta and be among the first to transform your pre-code workflow. Limited seats available for engineering teams.",
  primaryLabel: "Request Early Access",
  primaryHref: "/beta",
  secondaryLabel: "Read Sample PRD",
  secondaryHref: "#sample",
};
