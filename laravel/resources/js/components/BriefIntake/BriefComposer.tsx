import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, FileIcon, GithubIcon, PaperclipIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['.txt', '.pdf', '.docx', '.md'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface BriefComposerProps {
    onSubmit: (message: { content: string; files: File[]; repoUrls: string[] }) => void;
    isPending: boolean;
    placeholder?: string;
}

export function BriefComposer({
    onSubmit,
    isPending,
    placeholder = 'Describe your project idea, paste a brief, or attach files...',
}: BriefComposerProps) {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [repoUrls, setRepoUrls] = useState<string[]>([]);
    const [repoInput, setRepoInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showRepoInput, setShowRepoInput] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasContent = content.trim() || files.length > 0 || repoUrls.length > 0;
    const isDisabled = !hasContent || isPending;

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.overflowY = 'hidden';
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isDisabled) return;
        onSubmit({ content: content.trim(), files, repoUrls });
        setContent('');
        setFiles([]);
        setRepoUrls([]);
        setShowRepoInput(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const valid = Array.from(newFiles).filter((f) => {
            const ext = '.' + f.name.split('.').pop()?.toLowerCase();
            return ACCEPTED_TYPES.includes(ext) && f.size <= MAX_FILE_SIZE;
        });
        setFiles((prev) => [...prev, ...valid]);
    }, []);

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const addRepoUrl = () => {
        const url = repoInput.trim();
        if (url && url.includes('github.com') && !repoUrls.includes(url)) {
            setRepoUrls((prev) => [...prev, url]);
            setRepoInput('');
        }
    };

    const removeRepo = (index: number) => {
        setRepoUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="p-2.5 sm:p-3">
            <form onSubmit={handleSubmit}>
                <div
                    className={cn(
                        'rounded-xl border bg-card shadow-sm transition-colors',
                        isDragging ? 'border-primary/50 bg-primary/5' : 'border-border',
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isDragging && (
                        <div className="flex items-center justify-center py-6 text-sm text-primary">
                            Drop files here (.txt, .pdf, .docx, .md)
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        rows={2}
                        className={cn(
                            'block w-full resize-none overflow-y-hidden border-0 bg-transparent px-3.5 pt-3 pb-2 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:px-4 sm:text-sm',
                            isDragging && 'hidden',
                        )}
                        disabled={isPending}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!isDisabled) handleSubmit(e);
                            }
                        }}
                    />

                    {(files.length > 0 || repoUrls.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 px-3 pb-2 sm:px-4">
                            {files.map((file, i) => (
                                <span
                                    key={`file-${i}`}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground"
                                >
                                    <FileIcon className="h-3 w-3" />
                                    {file.name}
                                    <button type="button" onClick={() => removeFile(i)} className="hover:text-foreground">
                                        <XIcon className="h-2.5 w-2.5" />
                                    </button>
                                </span>
                            ))}
                            {repoUrls.map((url, i) => {
                                const repoName = url.split('github.com/')[1] || url;
                                return (
                                    <span
                                        key={`repo-${i}`}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground"
                                    >
                                        <GithubIcon className="h-3 w-3" />
                                        {repoName}
                                        <button type="button" onClick={() => removeRepo(i)} className="hover:text-foreground">
                                            <XIcon className="h-2.5 w-2.5" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {showRepoInput && (
                        <div className="flex items-center gap-2 px-3 pb-2 sm:px-4">
                            <GithubIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <input
                                type="text"
                                value={repoInput}
                                onChange={(e) => setRepoInput(e.target.value)}
                                placeholder="https://github.com/org/repo"
                                className="flex-1 border-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addRepoUrl();
                                    }
                                }}
                            />
                            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={addRepoUrl}>
                                Add
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 sm:px-3">
                        <div className="flex items-center gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".txt,.pdf,.docx,.md"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPending}
                            >
                                <PaperclipIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'h-8 w-8 text-muted-foreground hover:text-foreground',
                                    showRepoInput && 'bg-accent text-foreground',
                                )}
                                onClick={() => setShowRepoInput(!showRepoInput)}
                                disabled={isPending}
                            >
                                <GithubIcon className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-lg sm:h-8 sm:w-8"
                            disabled={isDisabled}
                        >
                            <ArrowUpIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
