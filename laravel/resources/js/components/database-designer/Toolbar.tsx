import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Download, FileCode, FileText } from 'lucide-react';

interface ToolbarProps {
    onExportMermaid: () => void;
    onExportSQL: () => void;
    onBackClick?: () => void;
    backButtonText?: string;
}

const Toolbar = ({ onExportMermaid, onExportSQL, onBackClick, backButtonText = 'Back to Project' }: ToolbarProps) => {
    return (
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
            <div className="flex items-center space-x-3">
                {onBackClick && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBackClick}
                            className="flex items-center gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                            title={backButtonText}
                            aria-label={backButtonText}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">{backButtonText}</span>
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                    </>
                )}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileCode className="h-4 w-4 text-primary" />
                    </div>
                    <h1 className="text-lg font-semibold text-foreground hidden md:block">Database Designer</h1>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {/* Export Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            title="Export schema in different formats"
                            aria-label="Export schema"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onExportMermaid} className="flex items-center gap-2 cursor-pointer">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="font-medium">Mermaid ERD</span>
                                <span className="text-xs text-muted-foreground">Export as .mermaid file</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportSQL} className="flex items-center gap-2 cursor-pointer">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="font-medium">SQL Script</span>
                                <span className="text-xs text-muted-foreground">Export as .sql file</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default Toolbar;
