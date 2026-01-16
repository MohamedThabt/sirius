import { FileText, GitBranch, Users, Zap, Shield, Database, Code, Workflow, Brain, Layout, Server, Lock, Gauge, Accessibility, CloudCog, GitMerge, ClipboardList, UsersRound, Shapes, Blocks, ScrollText, RefreshCw } from "lucide-react";

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
      badge: "Project Creation",
      label: "Step 1",
      title: "Start with a brief",
      description: "Paste your project description. Sirius generates a complete overview, PRD, and SRS automatically.",
    },
    {
      id: "FR-002",
      badge: "Decomposition",
      label: "Step 2",
      title: "Break it down",
      description: "Your project is decomposed into features, epics, and granular user stories with acceptance criteria.",
    },
    {
      id: "FR-003",
      badge: "Documentation",
      label: "Step 3",
      title: "Generate artifacts",
      description: "Each user story comes with ERDs, technical specs, sequence diagrams, and wireframes.",
    },
    {
      id: "FR-004",
      badge: "GitHub Export",
      label: "Step 4",
      title: "Export to GitHub",
      description: "Push your complete documentation suite to GitHub with a single click, keeping everything in sync.",
    },
    {
      id: "FR-005",
      badge: "Aggregation",
      label: "Step 5",
      title: "Unified ERD",
      description: "All entity relationships aggregate into a single project-level ERD for complete visibility.",
    },
  ],
};

export const teamCollaboration = {
  eyebrow: "For Teams",
  title: "Collaboration built for engineering",
  description: "Sirius keeps your entire team aligned—from architects to interns.",
  roles: [
    {
      role: "Software Engineers",
      description: "Get clear specs and complete documentation for every user story.",
      responsibilities: ["Implement user stories", "Review technical specs", "Use ERDs and diagrams"],
    },
    {
      role: "Team Leads",
      description: "Oversee documentation quality and track project decomposition.",
      responsibilities: ["Approve PRDs", "Assign stories", "Monitor progress"],
    },
    {
      role: "Administrators",
      description: "Manage teams, permissions, and GitHub integration settings.",
      responsibilities: ["Manage access", "Configure integrations", "Set policies"],
    },
  ],
  specializations: [
    { name: "Backend", icon: Server },
    { name: "RAG & Agents", icon: Brain },
    { name: "ML Engineering", icon: Zap },
    { name: "Frontend", icon: Layout },
    { name: "DevOps", icon: CloudCog },
    { name: "Security", icon: Lock },
    { name: "Data Engineering", icon: Database },
  ],
};

export const documentationSuite = {
  eyebrow: "Complete Documentation Suite",
  title: "Brief to build-ready docs, versioned and complete.",
  features: [
    {
      title: "PRDs",
      description: "Transform unstructured project briefs into clear, investor- and stakeholder-ready PRDs. Sirius orchestrates overview creation, refinement, and regeneration, while keeping a versioned history of every change.",
      icon: FileText,
    },
    {
      title: "Specs",
      description: "Generate formal Software Requirements Specifications with complete scope, assumptions, functional/non-functional requirements, interfaces, data models, constraints, and traceability matrices—ensuring every stakeholder shares a single, unambiguous source of truth.",
      icon: ScrollText,
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



export const aiGithubWorkflow = {
  eyebrow: "Seamless Integration",
  title: "AI-powered documentation. GitHub-ready.",
  description: "Sirius uses AI to generate comprehensive documentation and exports your entire suite to GitHub with a single click.",
  features: [
    {
      icon: Code,
      title: "Complete Documentation",
      description: "Generate comprehensive PRDs, SRSs, ERDs, sequence diagrams, and wireframes for your entire project.",
    },
    {
      icon: GitBranch,
      title: "GitHub Integration",
      description: "Export PRDs, SRSs, ERDs, and specs into a structured repository—ready for your team.",
    },
    {
      icon: Workflow,
      title: "Automated Workflow",
      description: "Changes sync automatically. Documentation stays in sync with your development cycle.",
    },
  ],
};

export const faqItems = [
  {
    question: "Who is Sirius for?",
    answer: "Sirius is built for software engineers, team leads, and technical teams who want to eliminate the friction of pre-code documentation. Whether you're a solo developer or managing a team, Sirius helps you move from idea to implementation faster.",
  },
  {
    question: "How does Sirius use AI?",
    answer: "Sirius uses large language models to transform your project brief into structured documentation. It generates PRDs, SRSs, user stories, ERDs, sequence diagrams, and wireframes automatically.",
  },
  {
    question: "How is my data secured?",
    answer: "All data is encrypted with AES-256 at rest and in transit. We follow industry best practices for security and maintain WCAG 2.1 AA accessibility compliance.",
  },
  {
    question: "What does 'pre-code' mean?",
    answer: "Pre-code refers to everything that happens before you write a single line of code—requirements gathering, documentation, and architectural planning. Sirius automates this phase so you can focus on building.",
  },
  {
    question: "Can I export my documentation?",
    answer: "Yes! Sirius integrates directly with GitHub. Export your entire documentation suite—PRDs, SRSs, ERDs, and user stories—to a structured repository with one click.",
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
