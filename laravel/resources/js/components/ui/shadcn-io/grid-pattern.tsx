"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[x: number, y: number]>;
  strokeDasharray?: string;
  className?: string;
  animated?: boolean;
  [key: string]: unknown;
}

function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  animated = true,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([squareX, squareY], index) => (
            animated ? (
              <motion.rect
                key={`${squareX}-${squareY}`}
                strokeWidth="0"
                width={width - 1}
                height={height - 1}
                x={squareX * width + 1}
                y={squareY * height + 1}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{
                  opacity: 1,
                  scale: 1
                }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              />
            ) : (
              <rect
                strokeWidth="0"
                key={`${squareX}-${squareY}`}
                width={width - 1}
                height={height - 1}
                x={squareX * width + 1}
                y={squareY * height + 1}
              />
            )
          ))}
        </svg>
      )}
    </svg>
  );
}

export { GridPattern };
export type { GridPatternProps };

