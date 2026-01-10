import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";

interface SiriusCTASectionProps {
  headline: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export const SiriusCTASection: React.FC<SiriusCTASectionProps> = ({
  headline,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}) => {
  return (
    <section className="sirius-section relative overflow-hidden">
      <GridPattern
        width={50}
        height={50}
        className="fill-primary/10 stroke-primary/20 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        squares={[
          [2, 1], [4, 3], [6, 2], [8, 4], [10, 1],
          [3, 5], [5, 6], [7, 5], [9, 7], [1, 6],
          [4, 8], [6, 9], [8, 8], [2, 9], [10, 6]
        ]}
        animated
      />

      <div className="absolute inset-0 sirius-gradient-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="sirius-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-section-title text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-body text-muted-foreground mb-8">{body}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="sirius"
              className="group"
              asChild
            >
              <a href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            {secondaryLabel && secondaryHref && (
              <Button
                size="lg"
                variant="siriusOutline"
                asChild
              >
                <a href={secondaryHref}>{secondaryLabel}</a>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiriusCTASection;
