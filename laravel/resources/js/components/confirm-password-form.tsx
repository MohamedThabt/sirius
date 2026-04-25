import { store } from '@/actions/App/Http/Controllers/Auth/ConfirmablePasswordController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export function ConfirmPasswordForm() {
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors, hasErrors }) => (
                    <>
                        {hasErrors && (
                            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive backdrop-blur-sm">
                                {errors.password || 'The provided password is incorrect.'}
                            </div>
                        )}
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-foreground">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoFocus
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <Button type="submit" className="h-11 w-full rounded-lg font-semibold" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm password
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
