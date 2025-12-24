import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { MermaidCode } from '@/components/MermaidCode';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type SharedData } from '@/types';
import { type FeatureItem, type ModuleItem } from '@/types/modules';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Props {
    project: Project;
    module: ModuleItem;
    feature: FeatureItem;
    specsMarkdown: string;
}

export default function Specs({ project, module, feature, specsMarkdown }: Props) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
        { title: feature.name, href: `/projects/${project.id}/modules/${module.id}/features/${feature.id}` },
        { title: 'Specifications', href: `/projects/${project.id}/modules/${module.id}/features/${feature.id}/specs` },
    ];

    return (
        <>
            <Head title={`Specs: ${feature.name}`} />
            <div className="min-h-screen bg-background">
                <div className="flex">
                    <FeatureSidebar
                        project={project}
                        module={module}
                        feature={feature}
                        activeSection="specs"
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />
                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <header className="mb-8">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feature Specifications</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">{feature.name}</p>
                                </div>
                            </header>

                            <div className="space-y-6">
                                <div className="rounded border bg-background p-6">
                                    <div className="prose prose-slate dark:prose-invert prose-table-bordered max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                code: ({ className, children, ...props }) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const language = match ? match[1] : '';
                                                    const isInline = !className?.includes('language-');

                                                    if (language === 'mermaid' && !isInline) {
                                                        const codeId = `mermaid${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
                                                        return <MermaidCode id={codeId}>{String(children).replace(/\n$/, '')}</MermaidCode>;
                                                    }

                                                    return (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {specsMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
