import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { SendIcon } from 'lucide-react';
import { useState } from 'react';

/**
 * ChatInput - Reusable AI prompt input component.
 * 
 * WHY EXTRACTED: This component was duplicated in PRD.tsx (lines 77-118) 
 * and SystemOverview.tsx (lines 76-121) with identical logic.
 * 
 * BEFORE: ~45 lines duplicated across 2 files
 * AFTER: Single source of truth, ~50 lines total
 */
export interface ChatInputProps {
    onSubmit: (prompt: string) => void;
    isGenerating: boolean;
    placeholder?: string;
    /** Optional className for the container div */
    className?: string;
}

export function ChatInput({ 
    onSubmit, 
    isGenerating, 
    placeholder = 'Ask me to improve or modify the content...',
    className = '',
}: ChatInputProps) {
    const [promptInput, setPromptInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promptInput.trim() || isGenerating) return;
        onSubmit(promptInput.trim());
        setPromptInput('');
    };

    return (
        <div className={`border-t border-slate-200/60 p-4 dark:border-slate-700/60 ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[60px] resize-none border-slate-200 pr-12 text-sm focus:border-blue-300 dark:border-slate-700 dark:focus:border-blue-600"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (promptInput.trim() && !isGenerating) {
                                    handleSubmit(e);
                                }
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-blue-500 p-0 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600"
                        disabled={!promptInput.trim() || isGenerating}
                    >
                        {isGenerating ? (
                            <TextShimmer className="text-xs text-white">Sending</TextShimmer>
                        ) : (
                            <SendIcon className="h-4 w-4 text-white" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ChatInput;
