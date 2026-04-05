import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowUpIcon, ChevronDownIcon, MessageCircleQuestionIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type ChatMode = 'agent' | 'ask';

export interface ChatInputProps {
    onSubmit: (prompt: string) => void;
    isGenerating: boolean;
    placeholder?: string;
    className?: string;
    mode?: ChatMode;
    onModeChange?: (mode: ChatMode) => void;
}

function AgentModeIcon({ className = '' }: { className?: string }) {
    return (
        <span className={`relative inline-flex items-center justify-center ${className}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="absolute -left-0.5 top-0.5 h-1 w-1 rounded-full bg-current/70" />
            <span className="absolute -right-0.5 bottom-0.5 h-1 w-1 rounded-full bg-current/70" />
        </span>
    );
}

export function ChatInput({
    onSubmit,
    isGenerating,
    placeholder = 'Ask me to improve or modify the content...',
    className = '',
    mode,
    onModeChange,
}: ChatInputProps) {
    const [promptInput, setPromptInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isDisabled = !promptInput.trim() || isGenerating;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promptInput.trim() || isGenerating) return;
        onSubmit(promptInput.trim());
        setPromptInput('');
        resetHeight();
    };

    const resetHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.overflowY = 'hidden';
            textareaRef.current.style.height = 'auto';
        }
    };

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.overflowY = 'hidden';
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [promptInput]);

    const showModeControls = mode !== undefined && onModeChange !== undefined;

    const modeConfig: Record<ChatMode, { label: string; icon: React.ComponentType<{ className?: string }>; hint: string }> = {
        agent: { label: 'Agent', icon: AgentModeIcon, hint: 'Can suggest & apply edits' },
        ask: { label: 'Ask', icon: MessageCircleQuestionIcon, hint: 'Discussion only' },
    };

    return (
        <div className={`p-2.5 sm:p-3 ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <textarea
                        ref={textareaRef}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={placeholder}
                        rows={1}
                        className="block w-full resize-none overflow-y-hidden border-0 bg-transparent px-3.5 pt-3 pb-2 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:px-4 sm:text-sm"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!isDisabled) {
                                    handleSubmit(e);
                                }
                            }
                        }}
                    />

                    <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 sm:px-3">
                        <div className="flex items-center gap-1.5">
                            {showModeControls && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 rounded-lg border border-border/60 bg-card px-2 text-xs text-foreground shadow-none hover:bg-card sm:h-7 sm:px-2.5"
                                        >
                                            {mode && (
                                                <>
                                                    {mode === 'agent' ? (
                                                        <AgentModeIcon className="h-3.5 w-3.5 sm:mr-1.5" />
                                                    ) : (
                                                        <MessageCircleQuestionIcon className="h-3.5 w-3.5 sm:mr-1.5" />
                                                    )}
                                                    <span className="hidden sm:inline">{modeConfig[mode].label}</span>
                                                </>
                                            )}
                                            <ChevronDownIcon className="ml-1 h-3 w-3 opacity-70 sm:ml-1.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="min-w-36">
                                        {(Object.keys(modeConfig) as ChatMode[]).map((m) => {
                                            const cfg = modeConfig[m];
                                            const Icon = cfg.icon;
                                            return (
                                                <DropdownMenuItem
                                                    key={m}
                                                    className={`cursor-pointer text-xs ${mode === m ? 'bg-muted' : ''}`}
                                                    onClick={() => onModeChange(m)}
                                                >
                                                    <Icon className="mr-2 h-3.5 w-3.5" />
                                                    {cfg.label}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            {showModeControls && mode && (
                                <span className="hidden text-[10px] text-muted-foreground/60 lg:inline">{modeConfig[mode].hint}</span>
                            )}
                        </div>

                        <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-lg sm:h-8 sm:w-8" disabled={isDisabled} aria-label="Send message">
                            {isGenerating ? <TextShimmer className="text-[10px]">...</TextShimmer> : <ArrowUpIcon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatInput;
