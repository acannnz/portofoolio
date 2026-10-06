<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name') }}</title>
    <meta name="description" content="{{ config('portfolio.name') }} — {{ config('portfolio.role') }}. {{ config('portfolio.about') }}">
    <meta name="theme-color" content="#050505">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('portfolio.name') }} — {{ config('portfolio.role') }}">
    <meta property="og:description" content="{{ config('portfolio.about') }}">
    <meta property="og:image" content="{{ url(config('portfolio.avatar')) }}">
    <meta property="og:url" content="{{ url('/') }}">
    <meta name="twitter:card" content="summary">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-[#050505] text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-violet-500/30 selection:text-violet-300">
    @inertia
</body>
</html>
