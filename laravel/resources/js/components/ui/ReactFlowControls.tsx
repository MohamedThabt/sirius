import { Button } from '@/components/ui/button';
import { useReactFlow } from '@xyflow/react';
import { Target, ZoomIn, ZoomOut } from 'lucide-react';

interface ReactFlowControlsProps {
    className?: string;
    showFitView?: boolean;
    showZoomIn?: boolean;
    showZoomOut?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function ReactFlowControls({
    className = '',
    showFitView = true,
    showZoomIn = true,
    showZoomOut = true,
    position = 'bottom-left',
}: ReactFlowControlsProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const handleZoomIn = () => zoomIn();
    const handleZoomOut = () => zoomOut();
    const handleFitView = () => fitView();

    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
    };

    return (
        <div className={`absolute z-10 flex flex-col gap-1 ${positionClasses[position]} ${className}`}>
            <div className="flex flex-col rounded-lg border border-border/60 bg-card/90 p-1 shadow-lg backdrop-blur-sm">
                {showZoomIn && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        className="h-8 w-8 rounded-md p-0 text-foreground transition-all duration-200 hover:bg-accent/50 hover:shadow-sm"
                        title="Zoom In"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                )}

                {showZoomOut && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        className="h-8 w-8 rounded-md p-0 text-foreground transition-all duration-200 hover:bg-accent/50 hover:shadow-sm"
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                )}

                {showFitView && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFitView}
                        className="h-8 w-8 rounded-md p-0 text-foreground transition-all duration-200 hover:bg-accent/50 hover:shadow-sm"
                        title="Center & Fit View"
                    >
                        <Target className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
