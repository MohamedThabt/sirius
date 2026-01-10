"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, FileText, GitBranch, Code, Database, Layout, Workflow } from "lucide-react";
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
  { id: 2, title: "SRS", icon: GitBranch, description: "Software Requirements Specification - Detailed technical requirements and system behavior documentation." },
  { id: 3, title: "ERD", icon: Database, description: "Entity Relationship Diagram - Visual representation of your database structure and relationships." },
  { id: 4, title: "Specs", icon: Code, description: "Technical Specifications - Comprehensive API endpoints, data models, and integration details." },
  { id: 5, title: "Wireframes", icon: Layout, description: "UI Wireframes - Low-fidelity visual guides showing layout and user interface structure." },
  { id: 6, title: "Workflows", icon: Workflow, description: "Process Workflows - User journeys and system flows mapped for optimal experience." },
];

export default function SiriusOrbitalFeatures() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [expandedNode, setExpandedNode] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;

    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => {
        const newAngle = (prev + 0.4) % 360;
        return Number(newAngle.toFixed(3));
      });
    }, 50);

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
        <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/20 shadow-[0_0_60px_rgba(249,115,22,0.15)]" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[280px] h-[280px] rounded-full border border-primary/30" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/20" />
          <div className="absolute w-[120px] h-[120px] rounded-full border border-primary/10" />
        </div>

        <div className="absolute z-50 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 rounded-full bg-card border-2 border-primary flex items-center justify-center">
            <div className="absolute inset-2 rounded-full bg-primary/10" />
            <Brain className="w-8 h-8 text-primary relative z-10" />
          </div>
          <span className="mt-2 text-xs font-medium text-foreground">
            Sirius AI
          </span>
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
                  (isHovered || isExpanded) && "border-primary shadow-[0_0_20px_rgba(249,115,22,0.4)] bg-primary/10"
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-8 w-56 p-3 bg-card/95 backdrop-blur-lg border border-primary/30 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.2)]"
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
