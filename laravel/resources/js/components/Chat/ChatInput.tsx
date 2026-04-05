import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowUpIcon, BotIcon, ChevronDownIcon, MessageCircleQuestionIcon } from 'lucide-react';
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
            textareaRef.current.style.height = 'auto';
        }
    };

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [promptInput]);

    const showModeControls = mode !== undefined && onModeChange !== undefined;

    const modeConfig: Record<ChatMode, { label: string; icon: typeof BotIcon; hint: string }> = {
        agent: { label: 'Agent', icon: BotIcon, hint: 'Can suggest & apply edits' },
        ask: { label: 'Ask', icon: MessageCircleQuestionIcon, hint: 'Discussion only' },
    };

    return (
        <div className={`p-3 ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <textarea
                        ref={textareaRef}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={placeholder}
                        rows={1}
                        className="block w-full resize-none border-0 bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
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

                    <div className="flex items-center justify-between px-3 pb-2.5">
                        <div className="flex items-center gap-1.5">
                            {showModeControls && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-7 rounded-lg border-border/70 px-2.5 text-xs"
                                        >
                                            {mode && (
                                                <>
                                                    {mode === 'agent' ? (
                                                        <BotIcon className="mr-1.5 h-3.5 w-3.5" />
                                                    ) : (
                                                        <MessageCircleQuestionIcon className="mr-1.5 h-3.5 w-3.5" />
                                                    )}
                                                    {modeConfig[mode].label}
                                                </>
                                            )}
                                            <ChevronDownIcon className="ml-1.5 h-3 w-3 opacity-70" />
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
                                <span className="hidden text-[10px] text-muted-foreground/60 sm:inline">{modeConfig[mode].hint}</span>
                            )}
                        </div>

                        <Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-lg" disabled={isDisabled} aria-label="Send message">
                            {isGenerating ? <TextShimmer className="text-[10px]">...</TextShimmer> : <ArrowUpIcon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatInput;
