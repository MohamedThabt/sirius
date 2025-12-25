import { router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bug, CheckCircle, Heart, Lightbulb, Rocket, Send, Sparkles, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { AstronautLottie, type AstronautState } from './AstronautLottie';
import { StarConfetti } from './StarConfetti';

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Feedback type configurations with rich interactions
const feedbackConfig: Record<
    FeedbackType,
    {
        icon: typeof Lightbulb;
        label: string;
        emoji: string;
        gradient: string;
        borderColor: string;
        astronautMessages: string[];
        placeholder: string;
        astronautState: AstronautState;
        bgPattern: string;
    }
> = {
    suggestion: {
        icon: Lightbulb,
        label: 'Idea',
        emoji: '💡',
        gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
        borderColor: 'border-amber-400/50',
        astronautMessages: ["Ooh, an idea! I'm all ears! 👂", 'Creative minds unite! ✨', "Let's make Sirius better together!"],
        placeholder: 'I have an idea! What if we could...',
        astronautState: 'wave',
        bgPattern: 'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
    },
    ux: {
        icon: Sparkles,
        label: 'UX',
        emoji: '✨',
        gradient: 'from-purple-500/20 via-violet-500/10 to-indigo-500/20',
        borderColor: 'border-purple-400/50',
        astronautMessages: ['Tell me what feels weird! 🤔', 'UX detective on the case! 🔍', "Let's smooth things out!"],
        placeholder: 'Something felt confusing when I tried to...\n\nI expected it to...',
        astronautState: 'thinking',
        bgPattern: 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
    },
    bug: {
        icon: Bug,
        label: 'Bug',
        emoji: '🐛',
        gradient: 'from-red-500/20 via-rose-500/10 to-pink-500/20',
        borderColor: 'border-red-400/50',
        astronautMessages: ['A wild bug appeared! 😱', "Let's squash this together! 🔨", 'Bugs fear me! ...mostly 😅'],
        placeholder: '🐛 I found a bug!\n\nWhat happened:\n\nSteps to reproduce:\n1. \n2. \n3. ',
        astronautState: 'confused',
        bgPattern: 'radial-gradient(circle at 50% 100%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
    },
};

/**
 * Creative, interactive feedback modal with rich animations.
 */
export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [capturingScreenshot, setCapturingScreenshot] = useState(false);

    const { data, setData, post, reset, errors, processing } = useForm({
        type: 'suggestion' as FeedbackType,
        message: '',
        expected: '',
        actual: '',
        page_url: typeof window !== 'undefined' ? window.location.href : '',
    });

    const config = useMemo(() => feedbackConfig[data.type], [data.type]);

    const astronautState = useMemo<AstronautState>(() => {
        if (showConfetti) return 'celebrate';
        return config.astronautState;
    }, [config.astronautState, showConfetti]);

    // Cycle through astronaut messages
    useEffect(() => {
        if (!open) return;

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % config.astronautMessages.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [open, config.astronautMessages.length]);

    // Reset message index when type changes
    useEffect(() => {
        setMessageIndex(0);
    }, [data.type]);

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
        toast.success('🚀 Feedback sent to the stars!', {
            description: 'Our astronaut is delivering your message.',
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
        toast.error('Houston, we have a problem! 🛸', {
            description: firstError || 'Please try again.',
        });
    }, []);

    // Define captureScreenshot first to avoid hoisting issues
    // Captures exactly what the user sees in their viewport - a pixel-perfect copy
    const captureScreenshot = useCallback(async (): Promise<File | null> => {
        try {
            if (typeof window === 'undefined') return null;

            // Dynamically import html-to-image (already installed in package.json)
            const htmlToImage = await import('html-to-image');

            // Capture the body element which contains the visible content
            // This captures exactly what's visible in the viewport
            const targetElement = document.body;

            const dataUrl = await htmlToImage.toPng(targetElement, {
                quality: 1.0, // Full quality for pixel-perfect screenshots
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2), // Limit to 2x for reasonable file size
                backgroundColor: window.getComputedStyle(document.body).backgroundColor || '#ffffff',
                width: window.innerWidth,
                height: window.innerHeight,
                filter: (node) => {
                    // Exclude dialogs, overlays, and the feedback widget to get clean viewport
                    if (node instanceof Element) {
                        const element = node as HTMLElement;
                        const computedStyle = window.getComputedStyle(element);

                        // Exclude modal dialogs and overlays
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

                        // Exclude fixed/absolute positioned overlays with high z-index
                        if ((computedStyle.position === 'fixed' || computedStyle.position === 'absolute') && parseInt(computedStyle.zIndex) > 1000) {
                            return false;
                        }

                        return true;
                    }
                    return true;
                },
            });

            // Convert data URL to File
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
                // Automatically capture screenshot if not already captured
                let finalScreenshot = screenshot;
                if (!finalScreenshot) {
                    // Show loading state
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
                            // Continue without screenshot - don't block submission
                        }
                    } catch (error) {
                        toast.dismiss(loadingToast);
                        // Continue without screenshot - don't block submission
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
                post('/beta/feedback', {
                    preserveScroll: true,
                    onSuccess: handleSuccess,
                    onError: handleError,
                });
            }
        },
        [data, post, handleSuccess, handleError, screenshot, screenshotPreview, captureScreenshot],
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
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:max-w-md">
                <VisuallyHidden>
                    <DialogPrimitive.Title>Feedback Form</DialogPrimitive.Title>
                    <DialogPrimitive.Description>
                        Share your feedback, suggestions, or report bugs to help us improve Sirius
                    </DialogPrimitive.Description>
                </VisuallyHidden>
                {/* Star confetti overlay */}
                <StarConfetti show={showConfetti} />

                {/* Dynamic gradient background */}
                <motion.div
                    key={data.type}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn('absolute inset-0 bg-gradient-to-br', config.gradient)}
                    style={{ backgroundImage: config.bgPattern }}
                />

                {/* Floating particles */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-primary/20"
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: '110%',
                                rotate: 0,
                                scale: 0.5 + Math.random() * 0.5,
                            }}
                            animate={{
                                y: '-10%',
                                rotate: 360,
                                transition: {
                                    duration: 8 + Math.random() * 4,
                                    repeat: Infinity,
                                    delay: i * 1.5,
                                    ease: 'linear',
                                },
                            }}
                        >
                            {['✦', '✧', '★', '·'][i % 4]}
                        </motion.div>
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex max-h-[90vh] flex-col overflow-hidden">
                    {/* Header with Astronaut - Fixed */}
                    <div className="shrink-0 px-6 pt-6 pb-4">
                        <div className="flex items-start gap-4">
                            {/* Animated Astronaut Container */}
                            <motion.div
                                animate={
                                    showConfetti
                                        ? {
                                              rotate: [0, -15, 15, -10, 10, 0],
                                              scale: [1, 1.2, 1.1, 1.15, 1],
                                              y: [0, -10, 0],
                                          }
                                        : {
                                              y: [0, -5, 0],
                                          }
                                }
                                transition={
                                    showConfetti
                                        ? {
                                              duration: 0.8,
                                          }
                                        : {
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: 'easeInOut',
                                          }
                                }
                                className="shrink-0"
                            >
                                <div
                                    className={cn(
                                        'rounded-2xl p-2.5 transition-colors duration-300',
                                        'bg-gradient-to-br from-primary/20 to-primary/5',
                                        'ring-2 ring-primary/20',
                                    )}
                                >
                                    <AstronautLottie state={astronautState} size={52} showAura={true} />
                                </div>
                            </motion.div>

                            {/* Title and Dynamic Message */}
                            <div className="min-w-0 flex-1 pt-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-foreground">Talk to Sirius</h2>
                                    <motion.span animate={{ rotate: [0, 15, 0, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                        ✨
                                    </motion.span>
                                </div>

                                {/* Animated astronaut speech bubble */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${data.type}-${messageIndex}`}
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                        transition={{ duration: 0.25 }}
                                        className={cn(
                                            'inline-block rounded-xl px-3 py-1.5 text-sm',
                                            'bg-muted/80 backdrop-blur-sm',
                                            'border border-border/50',
                                        )}
                                    >
                                        {config.astronautMessages[messageIndex]}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Form - Scrollable */}
                    <form id="feedback-form" onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent flex-1 overflow-y-auto px-6">
                            <div className="space-y-5 pb-4">
                                {/* Type Selection - Creative Cards */}
                                <div className="space-y-2.5">
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                        <Rocket className="size-3.5" />
                                        What's on your mind?
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.entries(feedbackConfig) as [FeedbackType, (typeof feedbackConfig)['suggestion']][]).map(
                                            ([type, cfg]) => {
                                                const isSelected = data.type === type;

                                                return (
                                                    <motion.button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleTypeSelect(type)}
                                                        whileHover={{ scale: 1.03, y: -2 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className={cn(
                                                            'relative flex flex-col items-center gap-2 rounded-xl p-3.5 transition-all duration-200',
                                                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                            isSelected
                                                                ? cn('bg-card shadow-lg', cfg.borderColor, 'border-2')
                                                                : 'border-2 border-transparent bg-muted/50 hover:bg-muted',
                                                        )}
                                                    >
                                                        <motion.span
                                                            className="text-2xl"
                                                            animate={
                                                                isSelected
                                                                    ? {
                                                                          scale: [1, 1.2, 1],
                                                                          rotate: [0, -10, 10, 0],
                                                                      }
                                                                    : {}
                                                            }
                                                            transition={{ duration: 0.4 }}
                                                        >
                                                            {cfg.emoji}
                                                        </motion.span>
                                                        <span
                                                            className={cn(
                                                                'text-xs font-semibold',
                                                                isSelected ? 'text-foreground' : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                        {isSelected && (
                                                            <motion.div
                                                                layoutId="activeType"
                                                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent"
                                                                transition={{ duration: 0.2 }}
                                                            />
                                                        )}
                                                    </motion.button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
                                            <Heart className="size-3.5" />
                                            Your message
                                        </Label>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span>{data.message.length}/5000</span>
                                        </div>
                                    </div>

                                    <motion.div
                                        key={data.type}
                                        initial={{ opacity: 0.8, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder={config.placeholder}
                                            className={cn('min-h-32 resize-none transition-all duration-300', 'bg-background/80 backdrop-blur-sm')}
                                            maxLength={5000}
                                        />
                                    </motion.div>

                                    {errors.message ? (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-1 text-xs text-destructive"
                                        >
                                            ⚠️ {errors.message}
                                        </motion.p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Ready to send 🚀</p>
                                    )}
                                </div>

                                {/* Expected & Actual Behavior (Bug Type Only) */}
                                {data.type === 'bug' && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-4">
                                            <div className="space-y-2.5">
                                                <Label htmlFor="expected" className="flex items-center gap-2 text-sm font-medium">
                                                    <CheckCircle className="size-3.5 text-green-500" />
                                                    Expected Behavior
                                                </Label>
                                                <motion.div
                                                    initial={{ opacity: 0.8, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Textarea
                                                        id="expected"
                                                        value={data.expected}
                                                        onChange={(e) => setData('expected', e.target.value)}
                                                        placeholder="What should have happened?"
                                                        className={cn(
                                                            'min-h-20 resize-none transition-all duration-300',
                                                            'bg-background/80 backdrop-blur-sm',
                                                        )}
                                                        maxLength={2000}
                                                    />
                                                </motion.div>
                                                <p className="text-xs text-muted-foreground">Describe what you expected to happen</p>
                                            </div>

                                            <div className="space-y-2.5">
                                                <Label htmlFor="actual" className="flex items-center gap-2 text-sm font-medium">
                                                    <XCircle className="size-3.5 text-red-500" />
                                                    Actual Behavior
                                                </Label>
                                                <motion.div
                                                    initial={{ opacity: 0.8, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Textarea
                                                        id="actual"
                                                        value={data.actual}
                                                        onChange={(e) => setData('actual', e.target.value)}
                                                        placeholder="What actually happened?"
                                                        className={cn(
                                                            'min-h-20 resize-none transition-all duration-300',
                                                            'bg-background/80 backdrop-blur-sm',
                                                        )}
                                                        maxLength={2000}
                                                    />
                                                </motion.div>
                                                <p className="text-xs text-muted-foreground">Describe what actually happened instead</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions - Fixed */}
                        <div className="shrink-0 border-t border-border/50 bg-background/95 px-6 py-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <p className="max-w-32 truncate text-xs text-muted-foreground/70">
                                    📍 {typeof window !== 'undefined' ? new URL(window.location.href).pathname : '/'}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClose}
                                        disabled={submitting}
                                        className="hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={processing || submitting || !data.message.trim()}
                                        className="min-w-28"
                                    >
                                        {processing || submitting ? (
                                            <>
                                                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="size-3.5" />
                                                Send
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
