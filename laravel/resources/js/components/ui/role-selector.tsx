import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code, Users, Briefcase, Zap } from "lucide-react";

interface Role {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  benefits: string[];
}

interface RoleSelectorProps {
  onRoleSelect: (role: Role) => void;
  selectedRole: Role | null;
  className?: string;
}

const roles: Role[] = [
  {
    id: 'developer',
    label: 'Developer',
    icon: <Code className="w-5 h-5" />,
    description: 'Build faster with AI-generated code and documentation',
    benefits: ['Auto-generate boilerplate', 'Smart code reviews', 'Technical documentation']
  },
  {
    id: 'pm',
    label: 'Product Manager',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Streamline planning with intelligent project insights',
    benefits: ['PRD generation', 'Roadmap planning', 'Stakeholder reports']
  },
  {
    id: 'team-lead',
    label: 'Team Lead',
    icon: <Users className="w-5 h-5" />,
    description: 'Coordinate teams with AI-powered workflow optimization',
    benefits: ['Sprint planning', 'Resource allocation', 'Progress tracking']
  },
  {
    id: 'startup',
    label: 'Startup Founder',
    icon: <Zap className="w-5 h-5" />,
    description: 'Launch faster with comprehensive project blueprints',
    benefits: ['MVP planning', 'Tech stack recommendations', 'Timeline optimization']
  }
];

export const RoleSelector = ({ onRoleSelect, selectedRole, className = "" }: RoleSelectorProps) => {
  return (
    <Card className={`p-6 bg-card/95 backdrop-blur-sm border border-border/50 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">I'm a...</h3>
        <p className="text-sm text-muted-foreground">Get personalized features for your role</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <Button
            key={role.id}
            variant={selectedRole?.id === role.id ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-center text-center transition-all duration-300 ${
              selectedRole?.id === role.id 
                ? 'bg-gradient-primary scale-105 shadow-lg animate-subtle-glow' 
                : 'hover:scale-105 hover:shadow-md hover:bg-secondary/50'
            }`}
            onClick={() => onRoleSelect(role)}
          >
            <div className="mb-2">
              {role.icon}
            </div>
            <div className="text-sm font-medium">{role.label}</div>
          </Button>
        ))}
      </div>

      {selectedRole && (
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg animate-slide-up">
          <h4 className="font-medium mb-2">{selectedRole.description}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {selectedRole.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};