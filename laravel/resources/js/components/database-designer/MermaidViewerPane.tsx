import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Download, Maximize, Minimize, Move, ZoomIn, ZoomOut } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Types
interface MermaidViewerPaneProps {
    code: string;
    error: string | null;
    setError: (error: string | null) => void;
    isFullScreen?: boolean;
    onToggleFullScreen?: () => void;
}

interface Position {
    x: number;
    y: number;
}

interface DragStart extends Position {}

// Constants
const MERMAID_CONFIG = {
    sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
    },
    darkTheme: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#1e40af',
        lineColor: '#64748b',
        sectionBkgColor: '#1e293b',
        altSectionBkgColor: '#0f172a',
        gridColor: '#334155',
        secondaryColor: '#f59e0b',
        tertiaryColor: '#10b981',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        tertiaryBkg: '#475569',
    },
    lightTheme: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#2563eb',
        lineColor: '#374151',
        sectionBkgColor: '#f3f4f6',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e5e7eb',
        secondaryColor: '#f59e0b',
        tertiaryColor: '#10b981',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        secondBkg: '#f1f5f9',
        tertiaryBkg: '#e2e8f0',
    },
};

const ZOOM_LIMITS = {
    min: 0.5,
    max: 2,
    step: 0.1,
};

export const MermaidViewerPane: React.FC<MermaidViewerPaneProps> = React.memo(({ code, error, setError, isFullScreen = false, onToggleFullScreen }) => {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<DragStart>({ x: 0, y: 0 });

    // Core Functions
    const initializeMermaid = (isDarkMode: boolean) => {
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            sequence: MERMAID_CONFIG.sequence,
            themeVariables: isDarkMode ? MERMAID_CONFIG.darkTheme : MERMAID_CONFIG.lightTheme,
            suppressErrorRendering: true,
        });
    };

    const applyTransformToSVG = (svgElement: SVGElement, position: Position, zoom: number) => {
        svgElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`;
        svgElement.style.transformOrigin = 'top left';
        svgElement.style.transition = isDragging ? 'none' : 'transform 0.2s ease';
    };

    const renderDiagram = async () => {
        if (!containerRef.current || !code.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Detect dark mode
            const isDarkMode = document.documentElement.classList.contains('dark');

            // Initialize mermaid with configuration
            initializeMermaid(isDarkMode);
            // Normalize newlines and trim extra spaces
const normalizedCode = code
  .replace(/\r\n/g, '\n')   // fix Windows newlines
  .replace(/\n{2,}/g, '\n') // remove extra empty lines
  .trim();

console.log("Rendering Mermaid code:\n", normalizedCode);

            // Validate the mermaid syntax
            const validation = await mermaid.parse(normalizedCode);
            if (!validation) {
                throw new Error('Invalid Mermaid syntax');
            }

            // Generate a unique ID for this render
            const id = `diagram-${Date.now()}`;

            // Render the diagram
            const { svg } = await mermaid.render(id, normalizedCode);

            // Insert the SVG into the container
            if (containerRef.current) {
                containerRef.current.innerHTML = svg;

                // Apply zoom and position to the SVG
                const svgElement = containerRef.current.querySelector('svg');
                if (svgElement) {
                    applyTransformToSVG(svgElement, position, zoom);
                }
            }
        } catch (err) {
            console.error('Mermaid rendering error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
            setError(errorMessage);

            if (containerRef.current) {
                containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full text-destructive">
            <div class="text-center p-8">
              <div class="w-16 h-16 mx-auto mb-4 text-destructive/50">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Syntax Error</h3>
              <p class="text-sm text-muted-foreground max-w-md">${errorMessage}</p>
            </div>
          </div>
        `;
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(renderDiagram, 300);
        return () => clearTimeout(debounceTimer);
    }, [code, zoom, position, setError]);

    // Re-render when dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (code.trim()) {
                renderDiagram();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [code, renderDiagram]);

    // Update SVG transition based on dragging state
    useEffect(() => {
        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
            svgElement.style.transition = isDragging ? 'none' : 'transform 0.2s ease';
        }
    }, [isDragging]);

    const handleDownloadSVG = () => {
        const svgElement = containerRef.current?.querySelector('svg');
        if (!svgElement) {
            toast.error('No diagram available to download');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sequence-diagram.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Diagram saved as SVG file');
    };

    const handleDownloadMermaid = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sequence-diagram.mermaid';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Mermaid code saved as file');
    };

    // Zoom Controls
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + ZOOM_LIMITS.step, ZOOM_LIMITS.max));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - ZOOM_LIMITS.step, ZOOM_LIMITS.min));
    const handleResetZoom = () => setZoom(1);

    // Mouse Event Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();

        const newPosition = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        };

        setPosition(newPosition);

        // Apply transform immediately for smoother movement
        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
            applyTransformToSVG(svgElement, newPosition, zoom);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch Event Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        const touch = e.touches[0];

        const newPosition = {
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
        };

        setPosition(newPosition);

        // Apply transform immediately for smoother movement
        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
            applyTransformToSVG(svgElement, newPosition, zoom);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Utility Functions
    const handleResetPosition = () => setPosition({ x: 0, y: 0 });

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Advanced UX Toolbar */}
            <div className="border-b border-border/50 bg-gradient-to-r from-background via-background/98 to-background backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left Section - View Controls */}
                    <div className="flex items-center gap-6">
                        {/* Zoom Control Cluster */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= ZOOM_LIMITS.min}
                                    className="h-9 w-9 rounded-lg p-0 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm disabled:opacity-40"
                                    title="Zoom Out (Ctrl + Scroll)"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>

                                <div className="flex h-9 min-w-[4rem] items-center justify-center rounded-lg bg-background/80 px-3 text-sm font-semibold text-foreground shadow-inner">
                                    {Math.round(zoom * 100)}%
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= ZOOM_LIMITS.max}
                                    className="h-9 w-9 rounded-lg p-0 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm disabled:opacity-40"
                                    title="Zoom In (Ctrl + Scroll)"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Navigation Cluster */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetPosition}
                                className="h-9 w-9 rounded-lg border border-border/60 bg-card/50 p-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent/50 hover:shadow-md"
                                title="Reset View to Center"
                            >
                                <Move className="h-4 w-4" />
                            </Button>

                            {/* Expand/Fullscreen Button */}
                            {onToggleFullScreen && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onToggleFullScreen}
                                    className="h-9 w-9 rounded-lg border border-border/60 bg-card/50 p-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent/50 hover:shadow-md"
                                    title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                                >
                                    {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Export Actions */}
                    <div className="flex items-center gap-3">
                        {/* Export Cluster */}
                        <div className="flex items-center rounded-xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadMermaid}
                                className="h-9 px-4 text-sm font-medium transition-all duration-200 hover:bg-accent/50 hover:shadow-sm"
                                title="Download Mermaid Source Code"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Code</span>
                                <span className="sm:hidden">Mermaid</span>
                            </Button>

                            <div className="mx-1 h-6 w-px bg-border/60" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadSVG}
                                disabled={!!error || isLoading}
                                className="h-9 px-4 text-sm font-medium transition-all duration-200 hover:bg-accent/50 hover:shadow-sm disabled:opacity-40"
                                title="Download SVG Image"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Image</span>
                                <span className="sm:hidden">SVG</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagram Container */}
            <div className="relative flex-1 overflow-auto bg-background">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <TextShimmer className="text-muted-foreground">Rendering diagram...</TextShimmer>
                    </div>
                )}

                <div
                    ref={containerRef}
                    className={`flex min-h-full items-center justify-center p-8 mermaid-diagram-cursor ${isDragging ? 'dragging' : ''}`}
                    style={{
                        minHeight: '100%',
                        background: 'radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.1) 1px, transparent 0)',
                        backgroundSize: '20px 20px',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />

                <style>{`
                    .mermaid-diagram-cursor {
                        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23a855f7" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23a855f7"/></svg>') 12 12, auto !important;
                    }
                    .mermaid-diagram-cursor.dragging {
                        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="%23ec4899" stroke="%23ec4899" stroke-width="2"/></svg>') 12 12, grabbing !important;
                    }
                    @media (prefers-color-scheme: dark) {
                        .mermaid-diagram-cursor {
                            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23c084fc" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23c084fc"/></svg>') 12 12, auto !important;
                        }
                        .mermaid-diagram-cursor.dragging {
                            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="%23f472b6" stroke="%23f472b6" stroke-width="2"/></svg>') 12 12, grabbing !important;
                        }
                    }
                `}</style>

                {!code.trim() && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <div className="mx-auto mb-4 h-16 w-16 opacity-50">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="mb-2 text-lg font-medium">Ready to render</p>
                            <p className="text-sm">Start typing Mermaid code or use the AI prompt to generate a diagram</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});;
