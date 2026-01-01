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
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-400 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...store.form()}>
                    {({ processing, errors, hasErrors }) => (
                        <>
                            {hasErrors && (
                                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-400 backdrop-blur-sm">
                                    {errors.email || 'An error occurred. Please try again.'}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="email@example.com" />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button 
                                    className="w-full h-11 font-semibold rounded-lg bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] hover:bg-white hover:text-black transition-all duration-200" 
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-[hsl(var(--text-secondary))]">
                    <span>Or, return to</span>
                    <TextLink href={login()} className="font-medium text-[hsl(var(--text-primary))] hover:underline">log in</TextLink>
                </div>
            </div>
        </div>
    );
}
