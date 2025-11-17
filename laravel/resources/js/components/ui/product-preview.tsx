import * as React from "react";
import { Card } from "@/components/ui/card";
import { FileText, GitBranch, BarChart3, MessageSquare, Calendar, CheckCircle } from "lucide-react";

interface ProductPreviewProps {
  className?: string;
}

export const ProductPreview = ({ className = "" }: ProductPreviewProps) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  const features = [
    { icon: <FileText className="w-4 h-4" />, label: "PRD Generator", active: true },
    { icon: <GitBranch className="w-4 h-4" />, label: "Workflow Design", active: false },
    { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", active: true },
    { icon: <MessageSquare className="w-4 h-4" />, label: "AI Chat", active: true },
    { icon: <Calendar className="w-4 h-4" />, label: "Timeline", active: false },
    { icon: <CheckCircle className="w-4 h-4" />, label: "Task Tracking", active: true }
  ];

  return (
    <div 
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative transition-transform duration-300 ease-out animate-3d-float"
        style={{
          transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`
        }}
      >
        {/* Main Dashboard */}
        <Card className="w-80 h-64 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border border-border/50 shadow-2xl overflow-hidden">
          <div className="p-4 h-full relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">AI SDLC Assistant</h3>
                <p className="text-xs text-muted-foreground">Real-time workspace</p>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Connected"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse [animation-delay:0.5s]" title="Processing"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:1s]" title="Syncing"></div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    feature.active 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-secondary/50 border-border/30 text-muted-foreground'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="text-xs font-medium">{feature.label}</span>
                  </div>
                  {feature.active && (
                    <div className="mt-1 h-1 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Project Progress</span>
                <span className="text-primary font-medium">73%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full animate-pulse-glow" style={{ width: '73%' }}></div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-bounce-gentle opacity-80"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-primary rounded-full animate-bounce-gentle [animation-delay:1s] opacity-60"></div>
          </div>
        </Card>

        {/* Floating Code Snippet */}
        <Card 
          className="absolute -top-4 -left-8 w-32 h-20 bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg rotate-[-15deg] animate-parallax-slow"
          style={{
            transform: `rotate(-15deg) translateZ(20px)`
          }}
        >
          <div className="p-2 text-xs font-mono">
            <div className="text-green-400">// AI Generated</div>
            <div className="text-blue-400">function</div>
            <div className="text-yellow-400">buildProject() {`{`}</div>
            <div className="text-muted-foreground ml-2">...</div>
          </div>
        </Card>

        {/* Floating Diagram */}
        <Card 
          className="absolute -bottom-6 -right-10 w-28 h-16 bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg rotate-[20deg] animate-parallax-medium"
          style={{
            transform: `rotate(20deg) translateZ(15px)`
          }}
        >
          <div className="p-2 flex items-center justify-center h-full">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-primary rounded-sm animate-pulse" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </Card>

        {/* Floating Chart */}
        <Card 
          className="absolute top-1/2 -right-6 w-24 h-16 bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg rotate-[10deg] animate-parallax-fast"
          style={{
            transform: `rotate(10deg) translateZ(10px)`
          }}
        >
          <div className="p-2 h-full flex items-end justify-center gap-1">
            {[60, 80, 40, 90, 70].map((height, i) => (
              <div 
                key={i}
                className="w-2 bg-accent rounded-t animate-bounce-gentle"
                style={{ 
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};