import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SiriusFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  className?: string;
  delay?: number;
}

export const SiriusFeatureCard: React.FC<SiriusFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  tag,
  className,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "sirius-card-hover p-6 md:p-8 group",
        className
      )}
    >
      <div className="mb-4 relative">
        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {tag && (
          <span className="absolute -top-2 -right-2 sirius-badge text-[10px]">
            {tag}
          </span>
        )}
      </div>
      <h3 className="font-sirius text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default SiriusFeatureCard;
