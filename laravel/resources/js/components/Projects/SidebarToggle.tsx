import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

export default function SidebarToggle({ isCollapsed, onToggle, className }: SidebarToggleProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={`hidden h-8 w-8 p-0 lg:flex ${className || ''}`}
            title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
    );
}
