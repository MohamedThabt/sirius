import AuthSplitLayoutTemplate from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    children,
    title,
    description,
    visualVariant,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    visualVariant?: 'login' | 'register';
}) {
    return (
        <AuthSplitLayoutTemplate title={title} description={description} visualVariant={visualVariant} {...props}>
            {children}
        </AuthSplitLayoutTemplate>
    );
}
