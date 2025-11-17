import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <AppLogoIcon className="h-8 w-auto" />
            <span className="text-base font-semibold leading-tight tracking-tight text-foreground">Sirius</span>
        </div>
    );
}
