import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircleIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { createModuleSchema } from '@/lib/validations';

interface CreateModuleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
}

export default function CreateModuleModal({
    open,
    onOpenChange,
    projectId,
}: CreateModuleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = (): boolean => {
        const result = createModuleSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: { [key: string]: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Submit form via Inertia post
            router.post(`/modules/single/${projectId}`, formData, {
                onError: (errors) => {
                    // Handle validation errors from backend
                    if (typeof errors === 'object') {
                        setErrors(errors as { [key: string]: string });
                    }
                    setIsLoading(false);
                },
            });
        } catch {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({ name: '', description: '' });
            setErrors({});
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-primary" />
                        Create New Module
                    </DialogTitle>
                    <DialogDescription>
                        Provide a name and description for your module. Our AI will automatically generate success metrics and determine the optimal implementation order.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Module Name Field */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Module Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., User Management, Order Processing, Inventory"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={errors.name ? 'border-red-500' : ''}
                            maxLength={255}
                        />
                        {errors.name && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircleIcon className="h-4 w-4" />
                                {errors.name}
                            </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                            {formData.name.length}/255 characters
                        </div>
                    </div>

                    {/* Module Description Field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-foreground"
                        >
                            Module Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe what this module handles, its responsibilities, and key entities..."
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`min-h-[150px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                            maxLength={5000}
                        />
                        {errors.description && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircleIcon className="h-4 w-4" />
                                {errors.description}
                            </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                            {formData.description.length}/5000 characters
                        </div>
                    </div>

                    {/* AI Info Banner */}
                    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">AI-Powered Generation</p>
                            <p className="mt-1">
                                Based on your input, AI will generate success metrics and determine the optimal implementation order for this module.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                                <SparklesIcon className="h-4 w-4" />
                            )}
                            {isLoading ? 'Generating...' : 'Generate Module'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
