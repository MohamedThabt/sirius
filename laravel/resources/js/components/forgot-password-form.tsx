import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import InputError from '@/components/input-error';
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
            {status && <div className="text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <Form {...store.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="email@example.com" />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </div>
    );
}
