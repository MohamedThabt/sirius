import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BackgroundVariant } from '@xyflow/react';
import { ChevronLeft, ChevronRight, Grid3X3, Layers, Layout, Maximize, Palette, Plus, Search, Snowflake, TreePine } from 'lucide-react';
import { useState } from 'react';

interface DiagramControlsProps {
    onSearch: (query: string) => void;
    onArrange: (algorithm: string) => void;
    onBackgroundChange: (variant: BackgroundVariant, options?: any) => void;
    onAddTable?: () => void;
    onToggleEditor?: () => void;
    onToggleFullScreen?: () => void;
    searchQuery: string;
    isEditorCollapsed?: boolean;
    isFullScreen?: boolean;
}

const DiagramControls = ({ 
    onSearch, 
    onArrange, 
    onBackgroundChange, 
    onAddTable,
    onToggleEditor,
    onToggleFullScreen,
    searchQuery,
    isEditorCollapsed = false,
    isFullScreen = false,
}: DiagramControlsProps) => {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        onSearch(value);
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2.5">
            {/* Left Section - Search */}
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                    placeholder="Search tables..."
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-9 bg-background/50"
                />
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
                {/* Add Table Button */}
                {onAddTable && (
                    <>
                        <Button 
                            variant="default" 
                            size="sm"
                            onClick={onAddTable}
                            className="flex items-center gap-2 h-9 shadow-sm"
                            title="Add new table"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Table</span>
                        </Button>
                        <Separator orientation="vertical" className="h-5" />
                    </>
                )}

                {/* Arrange Algorithms */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                            <Layout className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Arrange</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 border border-border bg-popover shadow-lg">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Layout Algorithms</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArrange('grid')} className="cursor-pointer">
                            <Grid3X3 className="mr-2 h-4 w-4" />
                            Grid Layout
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArrange('dagre')} className="cursor-pointer">
                            <TreePine className="mr-2 h-4 w-4" />
                            Hierarchical (Dagre)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArrange('snowflake')} className="cursor-pointer">
                            <Snowflake className="mr-2 h-4 w-4" />
                            Snowflake
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Background Options */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                            <Palette className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Background</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 border border-border bg-popover shadow-lg">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Background Style</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onBackgroundChange(BackgroundVariant.Dots)} className="cursor-pointer">
                            <Grid3X3 className="mr-2 h-4 w-4" />
                            Dots
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBackgroundChange(BackgroundVariant.Lines)} className="cursor-pointer">
                            <Layers className="mr-2 h-4 w-4" />
                            Lines
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBackgroundChange(BackgroundVariant.Cross)} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Cross
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBackgroundChange('none' as any)} className="cursor-pointer">None</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Toggle Editor Button - Only show in full screen mode to exit */}
                {onToggleEditor && isFullScreen && (
                    <>
                        <Separator orientation="vertical" className="h-5" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleEditor}
                            className="flex items-center gap-2 h-9"
                            title="Show Editor"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="hidden md:inline">Show Editor</span>
                        </Button>
                    </>
                )}

                {/* Full Screen Toggle */}
                {onToggleFullScreen && (
                    <>
                        <Separator orientation="vertical" className="h-5" />
                        <Button
                            variant={isFullScreen ? "default" : "outline"}
                            size="sm"
                            onClick={onToggleFullScreen}
                            className="flex items-center gap-2 h-9"
                            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                        >
                            <Maximize className="h-4 w-4" />
                            <span className="hidden md:inline">{isFullScreen ? 'Exit Full Screen' : 'Expand'}</span>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

DiagramControls.displayName = 'DiagramControls';

export default DiagramControls;
