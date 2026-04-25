import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
    status?: string;
}

export function ForgotPasswordForm({ status }: ForgotPasswordFormProps) {
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            {status && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-600 backdrop-blur-sm dark:text-green-400">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...store.form()}>
                    {({ processing, errors, hasErrors }) => (
                        <>
                            {hasErrors && (
                                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive backdrop-blur-sm">
                                    {errors.email || 'An error occurred. Please try again.'}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-foreground">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="h-11 w-full rounded-lg font-semibold" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()} className="font-medium text-primary hover:text-primary/80 hover:underline">
                        log in
                    </TextLink>
                </div>
            </div>
        </div>
    );
}
