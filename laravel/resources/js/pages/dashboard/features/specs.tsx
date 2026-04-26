import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface Project {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    project_id: number;
    summary?: string | null;
    description?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    priority?: string | null;
    order_of_implementation?: number | null;
}

interface Props {
    project: Project;
    feature: Feature;
    specsMarkdown: string;
}

export default function Specs({ project, feature, specsMarkdown }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}` },
        { title: feature.name, href: `/admin/features/${feature.id}` },
        { title: 'Specifications', href: '#' },
    ];

    const handleExport = () => {
        const blob = new Blob([specsMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${feature.name}-specs.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Specifications exported successfully!');
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(specsMarkdown);
            toast.success('Specifications copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Specifications - ${feature.name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <Link href={`/admin/features/${feature.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feature Specifications</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Complete specifications for {feature.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                            <FileText className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <Tabs defaultValue="rendered" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="rendered" className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Rendered View
                        </TabsTrigger>
                        <TabsTrigger value="markdown" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Markdown
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rendered" className="mt-6">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                                    Rendered Specifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{specsMarkdown}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="markdown" className="mt-6">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Raw Markdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap">
                                    {specsMarkdown}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
