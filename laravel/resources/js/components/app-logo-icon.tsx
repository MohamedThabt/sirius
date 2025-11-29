import { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const lightLogoUrl = new URL('../../images/brand-logo.png', import.meta.url).href;
const darkLogoUrl = new URL('../../images/brand-logo.png', import.meta.url).href;

type AppLogoIconProps = ImgHTMLAttributes<HTMLImageElement>;

export default function AppLogoIcon({ alt = 'Sirius logo', className, ...props }: AppLogoIconProps) {
    return (
        <>
            <img {...props} className={cn('dark:hidden', className)} src={lightLogoUrl} alt={alt} />
            <img
                {...props}
                className={cn('hidden dark:inline', className)}
                src={darkLogoUrl}
                alt={alt}
                aria-hidden="true"
            />
        </>
    );
}

export { lightLogoUrl, darkLogoUrl };
