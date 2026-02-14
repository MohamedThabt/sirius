"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [expandedNode, setExpandedNode] = useState<number | null>(null);
  const autoRotateRef = useRef(true);
  const angleRef = useRef(0);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const setAutoRotate = useCallback((val: boolean) => {
    autoRotateRef.current = val;
    if (val) lastTimeRef.current = 0;
  }, []);

  const calculateNodePosition = useCallback((index: number, total: number, angle: number) => {
    const nodeAngle = ((index / total) * 360 + angle) % 360;
    const radius = 140;
    const radian = (nodeAngle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const scale = 0.7 + 0.3 * ((1 + Math.sin(radian)) / 2);
    const opacity = 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2);
    return { x, y, angle: nodeAngle, zIndex, scale, opacity };
  }, []);

  // RAF-based rotation — updates DOM directly, zero React re-renders
  useEffect(() => {
    const animate = (time: number) => {
      if (autoRotateRef.current) {
        if (lastTimeRef.current) {
          const delta = time - lastTimeRef.current;
          angleRef.current = (angleRef.current + delta * 0.015) % 360;
        }
        lastTimeRef.current = time;
      }
      nodesRef.current.forEach((el, i) => {
        if (!el) return;
        const pos = calculateNodePosition(i, featureNodes.length, angleRef.current);
        const isExp = el.dataset.expanded === 'true';
        const isHov = el.dataset.hovered === 'true';
        el.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${isExp ? 1.3 : isHov ? 1.2 : pos.scale})`;
        el.style.zIndex = isExp ? '300' : isHov ? '200' : String(pos.zIndex);
        el.style.opacity = isExp || isHov ? '1' : String(pos.opacity);
        const line = el.querySelector<HTMLElement>('[data-connector]');
        if (line) line.style.transform = `rotate(${180 + pos.angle}deg)`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [calculateNodePosition]);

  const handleNodeClick = (nodeId: number) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
      setAutoRotate(true);
    } else {
      setExpandedNode(nodeId);
      setAutoRotate(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-[340px] h-[340px] flex items-center justify-center"
    >
      <div
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
          const Icon = node.icon;
          const isHovered = hoveredNode === node.id;
          const isExpanded = expandedNode === node.id;

          return (
            <div
              key={node.id}
              ref={(el) => { nodesRef.current[index] = el; }}
              data-hovered={isHovered}
              data-expanded={isExpanded}
              className="absolute cursor-pointer"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                const el = nodesRef.current[index];
                if (el) el.dataset.hovered = 'true';
              }}
              onMouseLeave={() => {
                setHoveredNode(null);
                const el = nodesRef.current[index];
                if (el) el.dataset.hovered = 'false';
              }}
              onClick={() => handleNodeClick(node.id)}
            >
              <div
                data-connector
                className={cn(
                  "absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent origin-left transition-opacity duration-300",
                  isExpanded || isHovered ? "opacity-100" : "opacity-40"
                )}
                style={{
                  width: "140px",
                }}
              />

              <div
                className={cn(
                  "relative w-11 h-11 rounded-full border-2 flex items-center justify-center transition-[border-color,box-shadow,background-color] duration-300",
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
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-colors duration-300",
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
