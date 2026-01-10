import React from "react";
import { cn } from "@/lib/utils";

interface SiriusRequirementPillProps {
  label: string;
  type: "functional" | "non-functional";
  className?: string;
}

export const SiriusRequirementPill: React.FC<SiriusRequirementPillProps> = ({
  label,
  type,
  className,
}) => {
  return (
    <span
      className={cn(
        type === "functional" ? "sirius-pill-functional" : "sirius-pill-nonfunctional",
        className
      )}
    >
      {label}
    </span>
  );
};

export default SiriusRequirementPill;
