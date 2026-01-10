import { store } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginFormProps {
    status?: string;
    canResetPassword: boolean;
}

export function LoginForm({ status, canResetPassword }: LoginFormProps) {
    return (
        <div className="flex w-full flex-col gap-6">
            {status && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-600 dark:text-green-400 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors, hasErrors }) => (
                    <>
                        {hasErrors && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive backdrop-blur-sm">
                                {errors.email || errors.password || 'Invalid credentials. Please try again.'}
                            </div>
                        )}
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-foreground">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-foreground">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm text-primary hover:text-primary/80" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-foreground">Remember me</Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="mt-4 w-full h-11 font-semibold rounded-lg" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            <p className="rounded-lg border border-border bg-muted/50 px-4 py-3">
                                🔒 Closed Beta: Access by invitation from Sirius team only
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
