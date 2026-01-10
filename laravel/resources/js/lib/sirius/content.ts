import { FileText, GitBranch, Users, Zap, Shield, Database, Code, Workflow, Brain, Layout, Server, Lock, Gauge, Accessibility, CloudCog, GitMerge } from "lucide-react";

export const heroContent = {
  badge: "Beta Access",
  title: "From Brief to",
  titleHighlight: "Build-Ready Docs",
  subtitle: "Describe your project. Sirius AI generates PRDs, user stories, ERDs, and wireframes—ready for AI code generators.",
  primaryCta: "Get Early Access",
  secondaryCta: "See How It Works",
  valueProps: [
    "Project brief → Complete documentation",
    "AI-optimized prompts for Cursor & Copilot",
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
  solutionDescription: "Input a project brief. Get a structured documentation suite—PRDs, SRSs, ERDs, and production-ready prompts for AI code tools.",
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
      badge: "AI Integration",
      label: "Step 4",
      title: "Export prompts",
      description: "Generate production-ready prompts for Cursor, Copilot, or your favorite AI code assistant.",
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
      description: "Get clear specs and AI-ready prompts for every user story.",
      responsibilities: ["Implement user stories", "Review technical specs", "Use generated prompts"],
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
  title: "Everything you need to transform a project brief into build-ready documentation.",
  features: [
    {
      title: "PRD Generation",
      description: "Transform project briefs into comprehensive Product Requirements Documents with stakeholder analysis.",
      icon: FileText,
    },
    {
      title: "SRS Creation",
      description: "Generate detailed Software Requirements Specifications with functional and non-functional requirements.",
      icon: Code,
    },
    {
      title: "User Stories",
      description: "Break down features into granular user stories with acceptance criteria, ready for sprint planning.",
      icon: Users,
    },
    {
      title: "ERD Generation",
      description: "Automatically generate entity-relationship diagrams that aggregate into a unified data model.",
      icon: Database,
    },
    {
      title: "Sequence Diagrams",
      description: "Visualize system interactions with auto-generated sequence diagrams for each user story.",
      icon: Workflow,
    },
    {
      title: "AI Prompt Export",
      description: "Generate production-ready prompts optimized for AI code assistants with full context.",
      icon: Zap,
    },
  ],
};



export const aiGithubWorkflow = {
  eyebrow: "Seamless Integration",
  title: "AI-powered. GitHub-ready.",
  description: "Sirius generates structured prompts for AI code tools and exports your entire documentation suite to GitHub with a single click.",
  features: [
    {
      icon: Code,
      title: "AI Prompt Export",
      description: "Generate context-rich prompts optimized for Cursor, GitHub Copilot, and other AI assistants.",
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
    answer: "Sirius uses large language models to transform your project brief into structured documentation. It generates PRDs, SRSs, user stories, ERDs, sequence diagrams, and wireframes—then creates optimized prompts for AI code assistants like Cursor.",
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
  primaryLabel: "Join the Sirius Beta",
  primaryHref: "#beta-signup",
  secondaryLabel: "Read Sample PRD",
  secondaryHref: "#sample",
};
