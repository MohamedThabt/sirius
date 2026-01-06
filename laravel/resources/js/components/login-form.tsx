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
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-400 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors, hasErrors }) => (
                    <>
                        {hasErrors && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-400 backdrop-blur-sm">
                                {errors.email || errors.password || 'Invalid credentials. Please try again.'}
                            </div>
                        )}
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
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
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="mt-4 w-full h-11 font-semibold rounded-lg bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] hover:bg-white hover:text-black transition-all duration-200" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        {/* CLOSED BETA: OAuth and signup disabled */}
                        {/* <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[hsl(var(--subtle-border))]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[hsl(var(--bg-secondary))] px-3 text-[hsl(var(--text-tertiary))]">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Button 
                                variant="outline" 
                                type="button" 
                                className="w-full h-11 border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200"
                                onClick={() => window.location.href = '/auth/google'}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
                        </div>

                        <div className="text-center text-sm text-[hsl(var(--text-secondary))]">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="font-medium text-[hsl(var(--text-primary))] hover:underline">
                                Sign up
                            </TextLink>
                        </div> */}

                        <div className="mt-4 text-center text-sm text-[hsl(var(--text-tertiary))]">
                            <p className="rounded-lg border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] px-4 py-3">
                                🔒 Closed Beta: Access by invitation from Sirius team only
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
