import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";

interface Step {
  id?: string;
  label: string;
  title: string;
  description: string;
  badge?: string;
}

interface SiriusStepTimelineProps {
  steps: Step[];
  className?: string;
}

export const SiriusStepTimeline: React.FC<SiriusStepTimelineProps> = ({
  steps,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className="absolute inset-0 h-full w-full fill-primary/5 stroke-primary/10 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        squares={[
          [1, 2],
          [3, 4],
          [5, 1],
          [7, 3],
          [9, 5],
          [2, 7],
          [4, 9],
          [6, 6],
          [8, 2],
          [10, 4],
        ]}
      />

      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-1/2" />

      <div className="space-y-8 md:space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.id || index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
              "relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8"
            )}
          >
            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
              <span className="text-xs font-sirius font-bold text-primary">
                {index + 1}
              </span>
            </div>

            <div
              className={cn(
                "sirius-card p-6 md:p-8",
                index % 2 === 0 ? "md:order-first" : "md:col-start-2"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-meta">{step.label}</span>
                {step.badge && (
                  <span className="sirius-pill-functional">{step.badge}</span>
                )}
              </div>
              <h3 className="font-sirius text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SiriusStepTimeline;
