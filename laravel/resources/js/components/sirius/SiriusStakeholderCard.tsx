import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface SiriusStakeholderCardProps {
  role: string;
  description: string;
  responsibilities: string[];
  className?: string;
  delay?: number;
}

export const SiriusStakeholderCard: React.FC<SiriusStakeholderCardProps> = ({
  role,
  description,
  responsibilities,
  className,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={cn("sirius-card-hover p-6", className)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-sirius text-lg font-semibold text-foreground">
          {role}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {responsibilities.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-card-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default SiriusStakeholderCard;
