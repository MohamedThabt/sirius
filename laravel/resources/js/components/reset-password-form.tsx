import { store } from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface ResetPasswordFormProps {
    token: string;
    email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <Form {...store.form()} transform={(data) => ({ ...data, token, email })} resetOnSuccess={['password', 'password_confirmation']}>
                {({ processing, errors, hasErrors }) => (
                    <>
                        {hasErrors && (
                            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 backdrop-blur-sm">
                                <p className="font-semibold">Please fix the following errors:</p>
                                <ul className="mt-1 list-inside list-disc text-left">
                                    {errors.email && <li>{errors.email}</li>}
                                    {errors.password && <li>{errors.password}</li>}
                                    {errors.password_confirmation && <li>{errors.password_confirmation}</li>}
                                    {errors.token && <li>Invalid or expired reset token. Please request a new one.</li>}
                                </ul>
                            </div>
                        )}
                        <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" autoComplete="email" value={email} className="mt-1 block w-full" readOnly />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                placeholder="Password"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                placeholder="Confirm password"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="mt-4 w-full h-11 font-semibold rounded-lg bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] hover:bg-white hover:text-black transition-all duration-200" 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Reset password
                        </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
