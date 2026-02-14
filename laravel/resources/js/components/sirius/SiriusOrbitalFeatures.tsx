"use client";
import { useState, useEffect, useRef } from "react";
import { FileText, Github, Database, Layout, Users, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureNode {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

const featureNodes: FeatureNode[] = [
  { id: 1, title: "PRD", icon: FileText, description: "Product Requirements Document - Defines the product vision, features, and success criteria for your project." },
  { id: 2, title: "GitHub Export", icon: Github, description: "GitHub Export - Push your complete documentation suite to GitHub with a single click." },
  { id: 3, title: "ERD", icon: Database, description: "Entity Relationship Diagram - Visual representation of your database structure and relationships." },
  { id: 4, title: "Specs", icon: FileCode, description: "Technical Specifications - Comprehensive API endpoints, data models, and integration details." },
  { id: 5, title: "Wireframes", icon: Layout, description: "UI Wireframes - Low-fidelity visual guides showing layout and user interface structure." },
  { id: 6, title: "Team Sync", icon: Users, description: "Team Sync - Real-time collaboration with your team on project documentation." },
];

// Sirius Star Component
const SiriusStar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative", className)}>
    {/* Outer bloom glow */}
    <motion.div
      className="absolute inset-[-60%] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Vertical diffraction spike */}
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[220%]"
      style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.8) 45%, white 50%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.1) 80%, transparent 100%)',
      }}
    />
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[6px] h-[180%] blur-[2px]"
      style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 55%, rgba(255,255,255,0.15) 75%, transparent 100%)',
      }}
    />

    {/* Horizontal diffraction spike */}
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[220%]"
      style={{
        background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.8) 45%, white 50%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.1) 80%, transparent 100%)',
      }}
    />
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[6px] w-[180%] blur-[2px]"
      style={{
        background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 55%, rgba(255,255,255,0.15) 75%, transparent 100%)',
      }}
    />

    {/* Diagonal spikes */}
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[140%] rotate-45 opacity-50"
      style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 45%, white 50%, rgba(255,255,255,0.5) 55%, transparent 100%)',
      }}
    />
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[140%] -rotate-45 opacity-50"
      style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 45%, white 50%, rgba(255,255,255,0.5) 55%, transparent 100%)',
      }}
    />

    {/* Central bright core */}
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
      style={{
        background: 'radial-gradient(circle, white 0%, rgba(200,200,200,1) 50%, rgba(200,200,200,0.5) 100%)',
        boxShadow: '0 0 20px 8px rgba(255,255,255,0.6), 0 0 40px 15px rgba(255,255,255,0.3), 0 0 60px 25px rgba(255,255,255,0.15)',
      }}
      animate={{
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Inner white hot core */}
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
      style={{
        boxShadow: '0 0 8px 4px rgba(255,255,255,0.9)',
      }}
    />
  </div>
);

export default function SiriusOrbitalFeatures() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [expandedNode, setExpandedNode] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;

    // Reduced from 50ms to 100ms for lower CPU/GPU usage
    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => {
        const newAngle = (prev + 0.8) % 360; // Double step to maintain speed at half frequency
        return Number(newAngle.toFixed(3));
      });
    }, 100);

    return () => clearInterval(rotationTimer);
  }, [autoRotate]);

  const handleNodeClick = (nodeId: number) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
      setAutoRotate(true);
    } else {
      setExpandedNode(nodeId);
      setAutoRotate(false);
    }
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 140;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const scale = 0.7 + 0.3 * ((1 + Math.sin(radian)) / 2);
    const opacity = 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2);

    return { x, y, angle, zIndex, scale, opacity };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-[340px] h-[340px] flex items-center justify-center"
    >
      <div
        ref={orbitRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/20 shadow-[0_0_60px_rgba(255,255,255,0.1)]" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[280px] h-[280px] rounded-full border border-primary/30" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/20" />
          <div className="absolute w-[120px] h-[120px] rounded-full border border-primary/10" />
        </div>

        {/* Central Sirius Star */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <SiriusStar className="w-20 h-20" />
        </div>

        {featureNodes.map((node, index) => {
          const position = calculateNodePosition(index, featureNodes.length);
          const Icon = node.icon;
          const isHovered = hoveredNode === node.id;
          const isExpanded = expandedNode === node.id;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-500 cursor-pointer"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${isExpanded ? 1.3 : isHovered ? 1.2 : position.scale})`,
                zIndex: isExpanded ? 300 : isHovered ? 200 : position.zIndex,
                opacity: isExpanded ? 1 : isHovered ? 1 : position.opacity,
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node.id)}
            >
              <div
                className={cn(
                  "absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent origin-left transition-opacity duration-300",
                  isExpanded || isHovered ? "opacity-100" : "opacity-40"
                )}
                style={{
                  width: "140px",
                  transform: `rotate(${180 + position.angle}deg)`,
                }}
              />

              <div
                className={cn(
                  "relative w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  "bg-background/80 backdrop-blur-sm border-primary/40",
                  (isHovered || isExpanded) && "border-primary shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-primary/10"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  (isHovered || isExpanded) ? "text-primary" : "text-muted-foreground"
                )} />
              </div>

              <div
                className={cn(
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-all duration-300",
                  (isHovered || isExpanded) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {node.title}
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-8 w-56 p-3 bg-card/95 backdrop-blur-lg border border-primary/30 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">{node.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {node.description}
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
