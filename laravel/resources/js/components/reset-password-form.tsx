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
                            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive backdrop-blur-sm">
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
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                name="email" 
                                autoComplete="email" 
                                value={email} 
                                className="mt-1 block w-full bg-muted border-border text-muted-foreground" 
                                readOnly 
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-foreground">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                                autoFocus
                                placeholder="Password"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="text-foreground">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                                placeholder="Confirm password"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="mt-4 w-full h-11 font-semibold rounded-lg" 
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
