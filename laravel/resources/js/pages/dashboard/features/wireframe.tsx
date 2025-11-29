import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, Image as ImageIcon, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Project {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    project_id: number;
    wireframe?: string | null;
}

interface Props {
    project: Project;
    feature: Feature;
}

export default function WireframePage({ project, feature }: Props) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}` },
        { title: feature.name, href: `/admin/features/${feature.id}` },
        { title: 'Wireframe', href: '#' },
    ];

    const handleDownload = () => {
        if (!feature.wireframe) {
            toast.error('No wireframe to download');
            return;
        }
        const link = document.createElement('a');
        link.href = feature.wireframe;
        link.download = `${feature.name}-wireframe.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Wireframe downloaded successfully!');
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 10, 50));
    };

    const handleZoomReset = () => {
        setZoom(100);
    };

    if (!isFullScreen) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Wireframe - ${feature.name}`} />

                <div className="w-full max-w-7xl mx-auto space-y-4 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wireframe</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Read-only view of {feature.name} wireframe</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {feature.wireframe && (
                                <>
                                    <div className="flex items-center gap-1 rounded-md border px-2 py-1">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomOut}>
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleZoomReset}>
                                            {zoom}%
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomIn}>
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setIsFullScreen(true)}>
                                <Maximize2 className="mr-2 h-4 w-4" />
                                Fullscreen
                            </Button>
                        </div>
                    </div>

                    <Card className="overflow-hidden">
                        {feature.wireframe ? (
                            <div className="flex min-h-[600px] items-center justify-center overflow-auto bg-muted/10 p-8">
                                <img
                                    src={feature.wireframe}
                                    alt={`${feature.name} wireframe`}
                                    style={{ width: `${zoom}%` }}
                                    className="rounded-lg border bg-white shadow-lg transition-all"
                                />
                            </div>
                        ) : (
                            <div className="flex min-h-[600px] items-center justify-center p-12">
                                <div className="text-center">
                                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold text-foreground">No Wireframe</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        A wireframe has not been created for this feature yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // Fullscreen mode
    return (
        <>
            <Head title={`Wireframe - ${feature.name}`} />
            <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                <div className="border-b bg-background px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Wireframe</h2>
                            <p className="text-xs text-muted-foreground">{feature.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {feature.wireframe && (
                                <div className="flex items-center gap-1 rounded-md border px-2 py-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomOut}>
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleZoomReset}>
                                        {zoom}%
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomIn}>
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setIsFullScreen(false)}>
                                <Minimize2 className="mr-2 h-4 w-4" />
                                Exit Fullscreen
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {feature.wireframe ? (
                        <div className="flex min-h-full items-center justify-center bg-muted/10 p-8">
                            <img
                                src={feature.wireframe}
                                alt={`${feature.name} wireframe`}
                                style={{ width: `${zoom}%` }}
                                className="rounded-lg border bg-white shadow-lg transition-all"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">No wireframe available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
