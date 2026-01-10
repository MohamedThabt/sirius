"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, ClipboardList, GitBranch, Database, Workflow, Brain, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";

interface FeatureItem {
  title: string;
  icon: LucideIcon;
  description: string;
}

const siriusFeatures: FeatureItem[] = [
  {
    title: "PRD Generation",
    icon: FileText,
    description: "Transform project briefs into comprehensive Product Requirements Documents with stakeholder analysis."
  },
  {
    title: "SRS Creation",
    icon: ClipboardList,
    description: "Generate detailed Software Requirements Specifications with functional and non-functional requirements."
  },
  {
    title: "User Stories",
    icon: GitBranch,
    description: "Break down features into granular user stories with acceptance criteria, ready for sprint planning."
  },
  {
    title: "ERD Generation",
    icon: Database,
    description: "Automatically generate entity-relationship diagrams that aggregate into a unified data model."
  },
  {
    title: "Sequence Diagrams",
    icon: Workflow,
    description: "Visualize system interactions with auto-generated sequence diagrams for each user story."
  },
  {
    title: "AI Prompt Export",
    icon: Brain,
    description: "Generate production-ready prompts optimized for AI code assistants with full context."
  }
];

function AnimatedContainer({
  className,
  delay = 0.1,
  children
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true,
        amount: 0.3
      }}
      transition={{
        duration: 0.5,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GridFeatureCard({
  feature
}: {
  feature: FeatureItem;
}) {
  const Icon = feature.icon;
  return (
    <div className="group relative p-6 transition-colors duration-300 hover:bg-muted/20">
      <div className="mb-4">
        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-medium text-foreground mb-2">
        {feature.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

const SiriusBentoFeatures: React.FC = () => {
  return (
    <section className="sirius-section bg-background" id="features">
      <div className="sirius-container">
        <AnimatedContainer className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-kicker mb-3 block">Complete Documentation Suite</span>

          <p className="text-body text-muted-foreground">
            Everything you need to transform a project brief into build-ready documentation.
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <div className="relative rounded-xl border border-border/50 overflow-hidden bg-card/30">
            <GridPattern
              width={80}
              height={80}
              className="fill-primary/5 stroke-border/30 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
              squares={[[0, 1], [1, 0], [2, 2], [3, 1], [4, 0], [0, 3], [2, 4], [4, 3], [1, 4], [3, 3]]}
              animated
            />

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {siriusFeatures.map((feature, i) => (
                <div
                  key={i}
                  className={cn(
                    "border-border/30",
                    i % 3 !== 2 && "lg:border-r",
                    i % 2 !== 1 && "sm:border-r lg:border-r-0",
                    i < 3 && "lg:border-b",
                    i < 4 && "sm:border-b lg:border-b-0",
                    i < 5 && "border-b sm:border-b-0"
                  )}
                >
                  <GridFeatureCard feature={feature} />
                </div>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
};

export default SiriusBentoFeatures;
