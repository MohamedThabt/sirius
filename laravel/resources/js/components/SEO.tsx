import { Head, usePage } from '@inertiajs/react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    noindex?: boolean;
    structuredData?: object;
}

export function SEO({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    siteName = 'Sirius',
    twitterCard = 'summary_large_image',
    noindex = false,
    structuredData,
}: SEOProps) {
    const page = usePage();
    const currentUrl = page.url;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fullTitle = title ? (title === 'Sirius' ? title : `${title} - ${siteName}`) : siteName;
    const defaultDescription = 'From Project Brief to Complete Spec. Describe your project in plain language. Sirius AI generates PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports to GitHub for AI code generators.';
    const defaultImage = image || (baseUrl ? `${baseUrl}/images/og-image.png` : '/images/og-image.png');
    const canonicalUrl = url || (baseUrl ? `${baseUrl}${currentUrl}` : currentUrl);

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={defaultImage} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={defaultImage} />

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#0F172A" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content={siteName} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
        </Head>
    );
}

