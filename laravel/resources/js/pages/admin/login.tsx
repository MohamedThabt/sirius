import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Meteors } from '@/components/ui/meteors';
import AppLogoIcon from '@/components/app-logo-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../landing.css';

export default function AdminLogin() {
    const [isVisible, setIsVisible] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
                {/* Space-themed background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                        }}
                    />
                    {/* Gradient orbs */}
                    <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
                    {/* Subtle meteors */}
                    <Meteors number={10} minDuration={3} maxDuration={8} />
                </div>

                <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
                    <div 
                        className="w-full max-w-md space-y-8"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        {/* Logo */}
                        <Link 
                            href="/" 
                            className="flex items-center justify-center transition-all duration-300 hover:opacity-80 hover:scale-105"
                        >
                            <AppLogoIcon className="h-10 w-auto" />
                        </Link>

                        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
                            <CardHeader className="text-center space-y-3 pb-6">
                                <div className="flex justify-center mb-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                                        <ShieldIcon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                                    Sign in to access the admin dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-destructive' : ''}
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={errors.password ? 'border-destructive' : ''}
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        />
                                        <Label htmlFor="remember" className="text-sm">
                                            Remember me
                                        </Label>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <p className="text-center text-xs text-muted-foreground">
                            Admin access only. Contact your system administrator if you need access.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

