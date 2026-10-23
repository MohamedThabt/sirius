import type { ClarificationAnswer, ClarificationQuestion } from '@/components/BriefIntake/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';

interface ClarificationCardProps {
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswer[]) => void;
    isSubmitted: boolean;
    isPending: boolean;
}

export function ClarificationCard({ questions, onSubmit, isSubmitted, isPending }: ClarificationCardProps) {
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

    const handleSelect = (questionId: string, optionId: string, mode: 'single' | 'multiple') => {
        if (isSubmitted) return;
        setSelections((prev) => {
            if (mode === 'single') {
                return { ...prev, [questionId]: [optionId] };
            }
            const current = prev[questionId] || [];
            return {
                ...prev,
                [questionId]: current.includes(optionId)
                    ? current.filter((id) => id !== optionId)
                    : [...current, optionId],
            };
        });
    };

    const allAnswered = questions.every((q) => {
        const sel = selections[q.id];
        return sel && sel.length > 0;
    });

    const handleSubmit = () => {
        const answers: ClarificationAnswer[] = questions.map((q) => ({
            question_id: q.id,
            selected_option_ids: selections[q.id] || [],
            custom_text: customTexts[q.id] || null,
        }));
        onSubmit(answers);
    };

    return (
        <div className="mt-3 space-y-5">
            {questions.map((question, qIdx) => {
                const selected = selections[question.id] || [];

                return (
                    <div key={question.id}>
                        <p className="mb-2.5 text-[13px] font-medium text-foreground">
                            {qIdx + 1}. {question.text}
                        </p>
                        <div className="space-y-1.5">
                            {question.options.map((option) => {
                                const isSelected = selected.includes(option.id);
                                const isRecommended = question.recommended_option_id === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        disabled={isSubmitted || isPending}
                                        onClick={() => handleSelect(question.id, option.id, question.selection_mode)}
                                        className={cn(
                                            'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors',
                                            isSelected
                                                ? 'border-primary/50 bg-primary/10 text-foreground'
                                                : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:bg-accent/30',
                                            isSubmitted && 'cursor-default opacity-80',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-4 w-4 shrink-0 items-center justify-center border',
                                                question.selection_mode === 'single' ? 'rounded-full' : 'rounded',
                                                isSelected
                                                    ? 'border-primary bg-primary'
                                                    : 'border-muted-foreground/40',
                                            )}
                                        >
                                            {isSelected && <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />}
                                        </div>
                                        <span className="flex-1">{option.label}</span>
                                        {isRecommended && (
                                            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                <SparklesIcon className="h-2.5 w-2.5" />
                                                Recommended
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {question.allow_custom_text && (
                            <textarea
                                placeholder="Other approach (optional)..."
                                disabled={isSubmitted || isPending}
                                value={customTexts[question.id] || ''}
                                onChange={(e) => setCustomTexts((prev) => ({ ...prev, [question.id]: e.target.value }))}
                                className="mt-2 w-full resize-none rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                                rows={2}
                            />
                        )}
                    </div>
                );
            })}

            {!isSubmitted && (
                <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isPending}
                    size="sm"
                    className="mt-2 w-full"
                >
                    {isPending ? 'Submitting...' : 'Submit Answers'}
                </Button>
            )}
        </div>
    );
}
