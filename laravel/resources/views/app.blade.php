<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on Linear's theme --}}
        <style>
            html {
                background-color: oklch(0.9784 0.0011 264.0521); /* Linear #F1F5F9 */
            }

            html.dark {
                background-color: oklch(0.1553 0.0226 265.3198); /* Linear #0F172A */
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

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

        {{-- Preload critical images for better performance --}}
        <link rel="preload" as="image" href="{{ url('/images/seo/image.png') }}" fetchpriority="high">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{--  Design System - Inter Font Family --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
