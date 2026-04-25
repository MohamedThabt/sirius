/**
 * Preload images for better performance
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.fetchPriority = priority;
        document.head.appendChild(link);

        const img = new Image();
        img.onload = () => {
            resolve();
        };
        img.onerror = () => {
            document.head.removeChild(link);
            reject(new Error(`Failed to preload image: ${src}`));
        };
        img.src = src;
    });
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[], priority: 'high' | 'low' = 'low'): Promise<void[]> {
    return Promise.all(sources.map((src) => preloadImage(src, priority).catch(() => {})));
}

/**
 * Preload images when they're about to be visible (using Intersection Observer)
 */
export function preloadImagesOnVisible(imageSources: string[], container: HTMLElement, rootMargin = '200px'): () => void {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Array.from(container.children).indexOf(entry.target);
                    if (index >= 0 && index < imageSources.length) {
                        preloadImage(imageSources[index], 'low');
                    }
                    observer.unobserve(entry.target);
                }
            });
        },
        { rootMargin },
    );

    container.querySelectorAll('img').forEach((img) => {
        observer.observe(img);
    });

    return () => observer.disconnect();
}
