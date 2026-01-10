import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Layers,
  FileText,
  GitBranch,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import SiriusOrbitalFeatures from "./SiriusOrbitalFeatures";

interface PipelineItem {
  id: string;
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  color: "primary" | "accent" | "muted" | "secondary";
}

const pipelineItems: PipelineItem[] = [
  {
    id: "documentation",
    icon: Layers,
    label: "DOCUMENTATION PIPELINE",
    title: "Structured documentation from day one",
    description: "Unlike fragmented doc tools, Sirius employs a structured pipeline that generates PRDs, SRSs, and technical specs in a cohesive flow. Each document builds on the previous, ensuring consistency and completeness.",
    color: "primary",
  },
  {
    id: "decomposition",
    icon: FileText,
    label: "SMART DECOMPOSITION",
    title: "Break complexity into clarity",
    description: "Through intelligent analysis, your project brief is decomposed into features, epics, and granular user stories. Each story comes with acceptance criteria, ERDs, and technical specifications.",
    color: "accent",
  },
  {
    id: "ai-export",
    icon: Sparkles,
    label: "AI-READY EXPORT",
    title: "Prompts optimized for AI tools",
    description: "Every user story generates production-ready prompts for Cursor, Copilot, and other AI code assistants. Context-rich prompts that understand your architecture and constraints.",
    color: "secondary",
  },
  {
    id: "github",
    icon: GitBranch,
    label: "GITHUB INTEGRATION",
    title: "Version-controlled documentation",
    description: "Export your entire documentation suite to GitHub with structured folders. Changes sync automatically, keeping your docs in lockstep with development.",
    color: "muted",
  },
];

const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const SiriusPipelineSection: React.FC = () => {
  const [activeId, setActiveId] = useState<string>("documentation");
  const activeItem = pipelineItems.find((item) => item.id === activeId);

  return (
    <section className="sirius-section relative overflow-hidden" id="pipeline">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      <FloatingParticles />

      <div className="sirius-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-wider mb-4 md:mb-6">
              <Zap className="w-3 h-3" />
              <span>Automated Pipeline</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 md:mb-6">
              Sirius's documentation{" "}
              <span className="sirius-gradient-text">pipeline</span> enables true
              automation
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-4">
              Sirius transforms your project brief into a complete documentation suite:
            </p>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {[
                "Generate PRDs and SRSs automatically",
                "Decompose into user stories with ERDs",
                "Export AI-optimized prompts",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="group cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Request Beta Access</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mb-6 flex items-center justify-center">
              <div className="hidden sm:block">
                <SiriusOrbitalFeatures />
              </div>
              <div className="sm:hidden flex items-center justify-center gap-2 h-32">
                {pipelineItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeId;
                  return (
                    <React.Fragment key={item.id}>
                      <motion.div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          isActive
                            ? "bg-primary border-primary"
                            : "bg-card border-border"
                        )}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveId(item.id)}
                      >
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                      </motion.div>
                      {index < pipelineItems.length - 1 && (
                        <div className="w-4 h-0.5 bg-border" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border p-6 relative z-10 shadow-xl shadow-black/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-accent/5 border border-primary/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {activeItem && <activeItem.icon className="w-5 h-5 text-primary" />}
                    <h3 className="font-semibold text-foreground">{activeItem?.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeItem?.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap gap-2">
                {pipelineItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeId;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-card border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-mono text-xs uppercase tracking-wider whitespace-nowrap">
                        {item.label.split(' ')[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SiriusPipelineSection;
