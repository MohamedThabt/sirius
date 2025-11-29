import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-4 w-4" />;
            case 'light':
                return <Sun className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-foreground"
                    >
                        {getCurrentIcon()}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end"
                    className="min-w-32 rounded-xl border-border/50 bg-background/95 shadow-lg backdrop-blur-sm"
                >
                    <DropdownMenuItem 
                        onClick={() => updateAppearance('light')}
                        className="rounded-lg transition-colors duration-150 focus:bg-primary/5"
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => updateAppearance('dark')}
                        className="rounded-lg transition-colors duration-150 focus:bg-primary/5"
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => updateAppearance('system')}
                        className="rounded-lg transition-colors duration-150 focus:bg-primary/5"
                    >
                        <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
