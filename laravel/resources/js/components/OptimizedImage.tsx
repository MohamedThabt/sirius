import { ImgHTMLAttributes, useEffect, useState } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export function OptimizedImage({ src, alt, width, height, priority = false, className = '', onLoad, onError, ...props }: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (priority && src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.fetchPriority = 'high';
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, [priority, src]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    if (hasError) {
        return (
            <div className={`flex items-center justify-center bg-muted ${className}`} style={{ width, height }} aria-label={alt}>
                <span className="text-xs text-muted-foreground">Image failed to load</span>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
            {!isLoaded && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}
