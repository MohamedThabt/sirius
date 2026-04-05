'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FeedbackProps {
    label: string;
    type?: 'default' | 'inline';
    onSubmit?: (data: { rating: number | null; message: string }) => void;
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

const LoveItIcon = ({ selected }: { selected: boolean }) => (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.5 8.97498H3.875V9.59998C3.875 11.4747 5.81046 12.8637 7.99817 12.8637C10.1879 12.8637 12.125 11.4832 12.125 9.59998V8.97498H11.5H4.5ZM7.99817 11.6137C6.59406 11.6137 5.63842 10.9482 5.28118 10.225H10.7202C10.3641 10.9504 9.40797 11.6137 7.99817 11.6137Z"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.15295 4.92093L5.375 3.5L4.59705 4.92093L3 5.21885L4.11625 6.39495L3.90717 8L5.375 7.30593L6.84283 8L6.63375 6.39495L7.75 5.21885L6.15295 4.92093ZM11.403 4.92093L10.625 3.5L9.84705 4.92093L8.25 5.21885L9.36625 6.39495L9.15717 8L10.625 7.30593L12.0928 8L11.8837 6.39495L13 5.21885L11.403 4.92093Z"
            className={cn('transition-colors duration-200', selected ? 'fill-primary' : 'fill-amber-500')}
        />
    </svg>
);

const ItsOkayIcon = () => (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM11.5249 10.8478L11.8727 10.3286L10.8342 9.6329L10.4863 10.1522C9.94904 10.9543 9.0363 11.4802 8.00098 11.4802C6.96759 11.4802 6.05634 10.9563 5.51863 10.1567L5.16986 9.63804L4.13259 10.3356L4.48137 10.8542C5.2414 11.9844 6.53398 12.7302 8.00098 12.7302C9.47073 12.7302 10.7654 11.9816 11.5249 10.8478ZM6.75 6.75C6.75 7.30228 6.30228 7.75 5.75 7.75C5.19772 7.75 4.75 7.30228 4.75 6.75C4.75 6.19772 5.19772 5.75 5.75 5.75C6.30228 5.75 6.75 6.19772 6.75 6.75ZM10.25 7.75C10.8023 7.75 11.25 7.30228 11.25 6.75C11.25 6.19772 10.8023 5.75 10.25 5.75C9.69771 5.75 9.25 6.19772 9.25 6.75C9.25 7.30228 9.69771 7.75 10.25 7.75Z"
        />
    </svg>
);

const NotGreatIcon = () => (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM5.75 7.75C6.30228 7.75 6.75 7.30228 6.75 6.75C6.75 6.19772 6.30228 5.75 5.75 5.75C5.19772 5.75 4.75 6.19772 4.75 6.75C4.75 7.30228 5.19772 7.75 5.75 7.75ZM11.25 6.75C11.25 7.30228 10.8023 7.75 10.25 7.75C9.69771 7.75 9.25 7.30228 9.25 6.75C9.25 6.19772 9.69771 5.75 10.25 5.75C10.8023 5.75 11.25 6.19772 11.25 6.75ZM11.5249 11.2622L11.8727 11.7814L10.8342 12.4771L10.4863 11.9578C9.94904 11.1557 9.0363 10.6298 8.00098 10.6298C6.96759 10.6298 6.05634 11.1537 5.51863 11.9533L5.16986 12.4719L4.13259 11.7744L4.48137 11.2558C5.2414 10.1256 6.53398 9.37982 8.00098 9.37982C9.47073 9.37982 10.7654 10.1284 11.5249 11.2622Z"
        />
    </svg>
);

const HateIcon = () => (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
        <path fillRule="evenodd" clipRule="evenodd" d="M4 9V16H5.5V9H4ZM12 9V16H10.5V9H12Z" className="fill-primary" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 9.57941 13.9367 11.0273 13 12.1536V14.2454C14.8289 12.7793 16 10.5264 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 10.5264 1.17107 12.7793 3 14.2454V12.1536C2.06332 11.0273 1.5 9.57941 1.5 8ZM8 14.5C8.51627 14.5 9.01848 14.4398 9.5 14.3261V15.8596C9.01412 15.9518 8.51269 16 8 16C7.48731 16 6.98588 15.9518 6.5 15.8596V14.3261C6.98152 14.4398 7.48373 14.5 8 14.5ZM3.78568 8.36533C4.15863 7.98474 4.67623 7.75 5.25 7.75C5.82377 7.75 6.34137 7.98474 6.71432 8.36533L7.78568 7.31548C7.14222 6.65884 6.24318 6.25 5.25 6.25C4.25682 6.25 3.35778 6.65884 2.71432 7.31548L3.78568 8.36533ZM10.75 7.75C10.1762 7.75 9.65863 7.98474 9.28568 8.36533L8.21432 7.31548C8.85778 6.65884 9.75682 6.25 10.75 6.25C11.7432 6.25 12.6422 6.65884 13.2857 7.31548L12.2143 8.36533C11.8414 7.98474 11.3238 7.75 10.75 7.75ZM6.25 12H9.75C9.75 11.0335 8.9665 10.25 8 10.25C7.0335 10.25 6.25 11.0335 6.25 12Z"
            className="fill-current"
        />
    </svg>
);

const EMOJI_OPTIONS = [
    { id: 0, icon: LoveItIcon, label: 'Love it' },
    { id: 1, icon: ItsOkayIcon, label: "It's okay" },
    { id: 2, icon: NotGreatIcon, label: 'Not great' },
    { id: 3, icon: HateIcon, label: 'Hate it' },
];

function EmojiButton({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'cursor-pointer flex size-8 items-center justify-center rounded-full p-0 transition-all duration-200',
                'hover:bg-primary/20 hover:text-primary',
                selected ? 'bg-primary/20 text-primary' : 'bg-transparent text-muted-foreground',
            )}
        >
            {children}
        </button>
    );
}

function FeedbackForm({
    selectedEmoji,
    setSelectedEmoji,
    message,
    setMessage,
    onSubmit,
    textareaRef,
}: {
    selectedEmoji: number | null;
    setSelectedEmoji: (emoji: number | null) => void;
    message: string;
    setMessage: (message: string) => void;
    onSubmit: () => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 p-3">
                <Textarea
                    placeholder="Your feedback..."
                    className="h-[100px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    ref={textareaRef}
                />
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <MarkdownSupportedIcon /> supported.
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/50 p-3">
                <div className="flex items-center gap-0.5">
                    {EMOJI_OPTIONS.map((option) => (
                        <EmojiButton
                            key={option.id}
                            selected={selectedEmoji === option.id}
                            onClick={(e) => {
                                e.preventDefault();
                                setSelectedEmoji(selectedEmoji === option.id ? null : option.id);
                            }}
                        >
                            <option.icon selected={selectedEmoji === option.id} />
                        </EmojiButton>
                    ))}
                </div>
                <Button type="submit" size="sm">
                    Send
                </Button>
            </div>
        </form>
    );
}

function DefaultFeedback({ label, onSubmit }: { label: string; onSubmit?: FeedbackProps['onSubmit'] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        onSubmit?.({ rating: selectedEmoji, message });
        setIsOpen(false);
        setSelectedEmoji(null);
        setMessage('');
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary" size="sm" className="font-medium">
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="center">
                <FeedbackForm
                    selectedEmoji={selectedEmoji}
                    setSelectedEmoji={setSelectedEmoji}
                    message={message}
                    setMessage={setMessage}
                    onSubmit={handleSubmit}
                />
            </PopoverContent>
        </Popover>
    );
}

function InlineFeedback({ label, onSubmit }: { label: string; onSubmit?: FeedbackProps['onSubmit'] }) {
    const [expanded, setExpanded] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [showContent, setShowContent] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (expanded) {
            setShowContent(true);
            // Focus textarea after a brief delay to allow animation
            setTimeout(() => textareaRef.current?.focus(), 100);
        } else {
            const timeout = setTimeout(() => setShowContent(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [expanded]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setExpanded(false);
                setSelectedEmoji(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        onSubmit?.({ rating: selectedEmoji, message });
        setExpanded(false);
        setSelectedEmoji(null);
        setMessage('');
    };

    const handleEmojiClick = (emojiId: number) => {
        if (selectedEmoji === emojiId) {
            setSelectedEmoji(null);
            setExpanded(false);
        } else {
            setSelectedEmoji(emojiId);
            setExpanded(true);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                'flex w-fit flex-col justify-start overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300',
                expanded ? 'max-h-[280px]' : 'max-h-12 rounded-full',
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-center gap-2 py-2 pl-4 pr-2 transition-all duration-200',
                    expanded && 'px-12',
                )}
            >
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="flex items-center gap-0.5">
                    {EMOJI_OPTIONS.map((option) => (
                        <EmojiButton
                            key={option.id}
                            selected={selectedEmoji === option.id}
                            onClick={(e) => {
                                e.preventDefault();
                                handleEmojiClick(option.id);
                            }}
                        >
                            <option.icon selected={selectedEmoji === option.id} />
                        </EmojiButton>
                    ))}
                </div>
            </div>
            {showContent && (
                <form className="w-full transition-opacity duration-300">
                    <div className="flex w-full flex-col gap-2 p-3">
                        <Textarea
                            placeholder="Your feedback..."
                            className="h-[100px] resize-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            ref={textareaRef}
                        />
                        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                            <MarkdownSupportedIcon /> supported.
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-border bg-muted/50 p-3">
                        <Button type="button" size="sm" onClick={handleSubmit}>
                            Send
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export function Feedback({ type = 'default', label, onSubmit }: FeedbackProps) {
    return type === 'default' || type === undefined ? (
        <DefaultFeedback label={label} onSubmit={onSubmit} />
    ) : (
        <InlineFeedback label={label} onSubmit={onSubmit} />
    );
}
