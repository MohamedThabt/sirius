import { router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Eye, Loader2, Pencil, Send, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';
import { type FeedbackType } from '@/types';

import { StarConfetti } from './StarConfetti';

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MarkdownSupportedIcon = () => (
    <svg fill="none" height="14" viewBox="0 0 22 14" width="22" xmlns="http://www.w3.org/2000/svg">
        <path
            clipRule="evenodd"
            d="M19.5 1.25H2.5C1.80964 1.25 1.25 1.80964 1.25 2.5V11.5C1.25 12.1904 1.80964 12.75 2.5 12.75H19.5C20.1904 12.75 20.75 12.1904 20.75 11.5V2.5C20.75 1.80964 20.1904 1.25 19.5 1.25ZM2.5 0C1.11929 0 0 1.11929 0 2.5V11.5C0 12.8807 1.11929 14 2.5 14H19.5C20.8807 14 22 12.8807 22 11.5V2.5C22 1.11929 20.8807 0 19.5 0H2.5ZM3 3.5H4H4.25H4.6899L4.98715 3.82428L7 6.02011L9.01285 3.82428L9.3101 3.5H9.75H10H11V4.5V10.5H9V6.79807L7.73715 8.17572L7 8.97989L6.26285 8.17572L5 6.79807V10.5H3V4.5V3.5ZM15 7V3.5H17V7H19.5L17 9.5L16 10.5L15 9.5L12.5 7H15Z"
            fill="currentColor"
            fillRule="evenodd"
            className="text-muted-foreground"
        />
    </svg>
);

// Feedback type configurations
const feedbackConfig: Record<
    FeedbackType,
    {
        label: string;
        emoji: string;
        borderColor: string;
        placeholder: string;
    }
> = {
    suggestion: {
        label: 'Idea',
        emoji: '💡',
        borderColor: 'border-amber-400/50',
        placeholder: 'I have an idea! What if we could...',
    },
    ux: {
        label: 'UX',
        emoji: '✨',
        borderColor: 'border-purple-400/50',
        placeholder: 'Something felt confusing when I tried to...\n\nI expected it to...',
    },
    bug: {
        label: 'Bug',
        emoji: '🐛',
        borderColor: 'border-red-400/50',
        placeholder: '🐛 I found a bug!\n\nWhat happened:\n\nSteps to reproduce:\n1. \n2. \n3. ',
    },
};

/**
 * Feedback modal component.
 */
export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [capturingScreenshot, setCapturingScreenshot] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data, setData, reset, errors, processing } = useForm({
        type: 'suggestion' as FeedbackType,
        message: '',
        expected: '',
        actual: '',
        page_url: typeof window !== 'undefined' ? window.location.href : '',
    });

    const config = useMemo(() => feedbackConfig[data.type], [data.type]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset();
            setScreenshot(null);
            setScreenshotPreview(null);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [open, reset]);

    // Cleanup screenshot preview URL on unmount
    useEffect(() => {
        return () => {
            if (screenshotPreview) {
                URL.revokeObjectURL(screenshotPreview);
            }
        };
    }, [screenshotPreview]);

    const handleSuccess = useCallback(() => {
        setShowConfetti(true);
        toast.success('🚀 Feedback sent!', {
            description: 'Thank you for helping us improve Sirius.',
        });

        setTimeout(() => {
            setShowConfetti(false);
            reset();
            setScreenshot(null);
            setScreenshotPreview(null);
            onOpenChange(false);
            setSubmitting(false);
        }, 2000);
    }, [reset, onOpenChange]);

    const handleError = useCallback((errs: Record<string, string>) => {
        setSubmitting(false);
        const firstError = Object.values(errs)[0];
        toast.error('Failed to send feedback', {
            description: firstError || 'Please try again.',
        });
    }, []);

    // Captures exactly what the user sees in their viewport
    const captureScreenshot = useCallback(async (): Promise<File | null> => {
        try {
            if (typeof window === 'undefined') return null;

            const htmlToImage = await import('html-to-image');
            const targetElement = document.body;

            const dataUrl = await htmlToImage.toPng(targetElement, {
                quality: 1.0,
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                backgroundColor: window.getComputedStyle(document.body).backgroundColor || '#ffffff',
                width: window.innerWidth,
                height: window.innerHeight,
                filter: (node) => {
                    if (node instanceof Element) {
                        const element = node as HTMLElement;
                        const computedStyle = window.getComputedStyle(element);

                        if (
                            element.closest('[data-slot="dialog-content"]') ||
                            element.closest('[data-slot="dialog-overlay"]') ||
                            element.closest('[role="dialog"]') ||
                            element.closest('[data-radix-portal]') ||
                            element.classList?.contains('feedback-widget') ||
                            element.id?.includes('feedback')
                        ) {
                            return false;
                        }

                        if ((computedStyle.position === 'fixed' || computedStyle.position === 'absolute') && parseInt(computedStyle.zIndex) > 1000) {
                            return false;
                        }

                        return true;
                    }
                    return true;
                },
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });

            console.log('Screenshot captured successfully:', file.size, 'bytes', `(${window.innerWidth}x${window.innerHeight})`);
            return file;
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            return null;
        }
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!data.message.trim()) {
                toast.error('Message is required!', {
                    description: 'Please enter your message.',
                });
                return;
            }

            setSubmitting(true);

            if (data.type === 'bug') {
                let finalScreenshot = screenshot;
                if (!finalScreenshot) {
                    setCapturingScreenshot(true);
                    const loadingToast = toast.loading('Capturing screenshot... 📸', { id: 'screenshot-capture' });

                    try {
                        finalScreenshot = await captureScreenshot();
                        if (finalScreenshot) {
                            setScreenshot(finalScreenshot);
                            const previewUrl = URL.createObjectURL(finalScreenshot);
                            setScreenshotPreview(previewUrl);
                            toast.success('Screenshot captured!', { id: 'screenshot-capture' });
                        } else {
                            toast.dismiss(loadingToast);
                        }
                    } catch (error) {
                        toast.dismiss(loadingToast);
                        console.warn('Screenshot capture failed, continuing without screenshot:', error);
                    } finally {
                        setCapturingScreenshot(false);
                    }
                }

                const formData = new FormData();
                formData.append('title', data.message.slice(0, 100));
                formData.append('description', data.message);
                formData.append('steps', 'Submitted via feedback widget');
                formData.append('expected', data.expected || 'N/A');
                formData.append('actual', data.actual || 'N/A');
                formData.append('severity', 'medium');
                formData.append('page_url', data.page_url);
                if (finalScreenshot) {
                    formData.append('screenshot', finalScreenshot);
                }

                router.post('/beta/issues', formData, {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        if (screenshotPreview) {
                            URL.revokeObjectURL(screenshotPreview);
                        }
                        handleSuccess();
                    },
                    onError: handleError,
                });
            } else {
                // Post feedback
                router.post('/beta/feedback', {
                    type: data.type,
                    message: data.message,
                    page_url: data.page_url,
                }, {
                    preserveScroll: true,
                    onSuccess: handleSuccess,
                    onError: handleError,
                });
            }
        },
        [data, handleSuccess, handleError, screenshot, screenshotPreview, captureScreenshot],
    );

    const handleClose = useCallback(() => {
        if (!submitting) {
            onOpenChange(false);
        }
    }, [submitting, onOpenChange]);

    const handleTypeSelect = useCallback(
        (type: FeedbackType) => {
            setData('type', type);
            if (type !== 'bug') {
                setScreenshot(null);
                setScreenshotPreview(null);
                setData('expected', '');
                setData('actual', '');
            }
        },
        [setData],
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden border border-border bg-card p-0 shadow-2xl sm:max-w-[380px]">
                <VisuallyHidden>
                    <DialogPrimitive.Title>Feedback Form</DialogPrimitive.Title>
                    <DialogPrimitive.Description>
                        Share your feedback, suggestions, or report bugs to help us improve Sirius
                    </DialogPrimitive.Description>
                </VisuallyHidden>

                {/* Star confetti overlay */}
                <StarConfetti show={showConfetti} />

                {/* Content */}
                <div className="relative z-10 flex max-h-[90vh] flex-col overflow-hidden">
                    {/* Form */}
                    <form id="feedback-form" onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                        {/* Textarea Section */}
                        <div className="flex flex-1 flex-col gap-2 p-4">
                            {/* Type Selection Pills */}
                            <div className="mb-2 flex items-center gap-1.5">
                                {(Object.entries(feedbackConfig) as [FeedbackType, (typeof feedbackConfig)['suggestion']][]).map(
                                    ([type, cfg]) => {
                                        const isSelected = data.type === type;
                                        return (
                                            <motion.button
                                                key={type}
                                                type="button"
                                                onClick={() => handleTypeSelect(type)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                                                    isSelected
                                                        ? cn('border-2 bg-card shadow-sm', cfg.borderColor)
                                                        : 'border-2 border-transparent bg-muted/50 text-muted-foreground hover:bg-muted',
                                                )}
                                            >
                                                <span>{cfg.emoji}</span>
                                                <span>{cfg.label}</span>
                                            </motion.button>
                                        );
                                    },
                                )}
                            </div>

                            {/* Write/Preview Toggle */}
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(false)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200',
                                            !previewMode
                                                ? 'bg-card text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <Pencil className="size-3" />
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(true)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200',
                                            previewMode
                                                ? 'bg-card text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <Eye className="size-3" />
                                        Preview
                                    </button>
                                </div>
                                {/* Markdown supported hint */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MarkdownSupportedIcon />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {previewMode ? (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="min-h-[120px] rounded-lg border border-input bg-background/80 p-3 text-sm"
                                    >
                                        {data.message ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>{data.message}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={data.type}
                                        initial={{ opacity: 0.8, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Textarea
                                            ref={textareaRef}
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder={config.placeholder}
                                            className="min-h-[120px] resize-none border-input bg-background/80"
                                            maxLength={5000}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {errors.message && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-1 text-xs text-destructive"
                                >
                                    ⚠️ {errors.message}
                                </motion.p>
                            )}

                            {/* Expected & Actual Behavior (Bug Type Only) */}
                            {data.type === 'bug' && (
                                <>
                                    <Separator className="my-2" />
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="expected" className="flex items-center gap-2 text-xs font-medium">
                                                <CheckCircle className="size-3 text-green-500" />
                                                Expected Behavior
                                            </Label>
                                            <Textarea
                                                id="expected"
                                                value={data.expected}
                                                onChange={(e) => setData('expected', e.target.value)}
                                                placeholder="What should have happened?"
                                                className="min-h-16 resize-none border-input bg-background/80 text-sm"
                                                maxLength={2000}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="actual" className="flex items-center gap-2 text-xs font-medium">
                                                <XCircle className="size-3 text-red-500" />
                                                Actual Behavior
                                            </Label>
                                            <Textarea
                                                id="actual"
                                                value={data.actual}
                                                onChange={(e) => setData('actual', e.target.value)}
                                                placeholder="What actually happened?"
                                                className="min-h-16 resize-none border-input bg-background/80 text-sm"
                                                maxLength={2000}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer with send button */}
                        <div className="flex items-center justify-end border-t border-border bg-muted/50 p-3">
                            {/* Send Button */}
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing || submitting || !data.message.trim() || capturingScreenshot}
                                className="min-w-20"
                            >
                                {processing || submitting || capturingScreenshot ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        {capturingScreenshot ? '📸' : 'Sending'}
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-3.5" />
                                        Send
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
