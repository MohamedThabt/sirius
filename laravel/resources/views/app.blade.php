<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <script async src="https://www.googletagmanager.com/gtag/js?id=G-333ZHPTC8B"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-333ZHPTC8B');
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                try {
                    const savedAppearance = localStorage.getItem('appearance');
                    const appearance = savedAppearance || '{{ $appearance ?? "system" }}';

                    if (appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                        document.documentElement.style.background = '#0f0f0f'; /* --bg-chrome */
                    } else {
                        document.documentElement.classList.add('light');
                        document.documentElement.style.colorScheme = 'light';
                        document.documentElement.style.background = '#f5f5f5'; /* canvas light */
                    }
                } catch (e) {
                    // Fallback if localStorage is inaccessible
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on Cursor dark theme --}}
        <style>
            html {
                background-color: #f5f5f5; /* Light canvas */
            }

            html.dark {
                background-color: #0f0f0f; /* Cursor --bg-chrome */
                --bg-chrome: #0f0f0f;
            }
        </style>

        <title inertia>{{ config('app.name', 'Sirius') }}</title>

        {{-- Default SEO Meta Tags (can be overridden by Inertia Head component) --}}
        <meta name="description" content="From Project Brief to Complete Spec. Describe your project in plain language. Sirius AI generates PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports to GitHub for AI code generators.">
        <meta name="keywords" content="AI project planning, PRD generator, ERD generator, wireframe generator, software requirements, project documentation, AI code generation, GitHub integration, sequence diagrams, user stories">
        <meta name="author" content="Sirius">
        <meta name="theme-color" content="#0F172A">

        {{-- Open Graph Defaults --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name', 'Sirius') }}">
        <meta property="og:locale" content="en_US">
        <meta property="og:image" content="{{ url('/images/seo/image.png') }}">

        {{-- Twitter Card Defaults --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="{{ url('/images/seo/image.png') }}">

        <link rel="icon" href="/favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/favicon.png">

        {{--  Design System - Inter and EB Garamond Font Families with optimized loading --}}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        {{-- Load font stylesheet with media="print" then swap to avoid render-blocking --}}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'">
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"></noscript>

        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
