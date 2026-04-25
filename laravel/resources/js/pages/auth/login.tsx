import LoginSignupPage from '@/components/login-signup';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return <LoginSignupPage initialMode="login" status={status} canResetPassword={canResetPassword} />;
}
