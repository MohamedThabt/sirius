import { Button } from '@/components/ui/button';
import { CheckCircleIcon, CheckIcon, Loader2Icon } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    field: string; // Using string to be compatible with keyof ProjectFormData from parent
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    projectName: string;
    expectedScale: string;
    businessSteps: Step[];
    technicalSteps: Step[];
    formData: Record<string, string>;
    canSubmit: boolean;
    isSubmitting?: boolean;
}

/**
 * Review Modal component extracted from Prepare.tsx.
 * 
 * WHY: The modal was 65 lines of JSX embedded in the main component,
 * causing unnecessary re-renders of the parent. Extracting it:
 * 1. Reduces parent component complexity
 * 2. Allows independent optimization
 * 3. Improves readability
 */
export function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    projectName,
    expectedScale,
    businessSteps,
    technicalSteps,
    formData,
    canSubmit,
    isSubmitting = false,
}: ReviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-lg border bg-background shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold">Review your brief</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4 scrollbar-hide">
                    {/* Project Info */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">Project</div>
                            <div className="text-sm font-medium">{projectName}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">Expected Users</div>
                            <div className="text-sm font-medium">{expectedScale}</div>
                        </div>
                    </div>

                    {/* Business Steps */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Business</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {businessSteps.map((step) => (
                                <div key={`rev-b-${step.id}`} className="rounded-lg border p-3">
                                    <div className="text-xs text-muted-foreground">{step.title}</div>
                                    <div className="mt-1 whitespace-pre-wrap text-sm">
                                        {formData[step.field]?.trim()?.length ? (
                                            formData[step.field]
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technical Steps */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Technical</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {technicalSteps.map((step) => (
                                <div key={`rev-t-${step.id}`} className="rounded-lg border p-3">
                                    <div className="text-xs text-muted-foreground">{step.title}</div>
                                    <div className="mt-1 whitespace-pre-wrap text-sm">
                                        {formData[step.field]?.trim()?.length ? (
                                            formData[step.field]
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t px-4 py-3">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        Tip: Alt+S to open review, Ctrl+Enter to submit
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Back
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="bg-gradient-to-r from-primary to-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Complete Brief
                                    <CheckIcon className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewModal;
