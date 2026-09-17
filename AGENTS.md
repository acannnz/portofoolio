<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

## Architectural & Debugging Lessons Learned (Durable Memory)

### 1. Sticky Viewport vs Overflow-X Traps
- **Issue**: Any parent/ancestor with `overflow-x: hidden` or `overflow: hidden` (such as `<body>` or root page wrapper `<div>`) completely breaks `position: sticky` in modern browsers (Chromium, Firefox, Safari).
- **Symptom**: The sticky canvas/viewport is scrolled off-screen immediately into negative coordinates, rendering the page completely black (or whatever root background color is set).
- **Fix**: Never put `overflow-x: hidden` on ancestors of `position: sticky`. Use viewport-contained widths (`w-full max-w-full`) or container clip instead.

### 2. High-Refresh Scroll Animation (240 FPS)
- **Implementation**: Use native wheel/scroll listeners mapping directly to canvas redraw without heavy scroll-jacking wrappers like Lenis that cause latency or desync.
- **Asset Format**: Use WebP image sequences (`.webp`) rather than heavy JPEG/PNG for instant decoding and minimal memory footprint.

### 3. Framer Motion Component Imports
- **Rule**: Whenever `<motion.*>` tags are used in JSX/React templates, ensure `import { motion } from 'framer-motion';` is explicitly declared. Omitting it causes `ReferenceError: motion is not defined` and aborts component mounting.

### 4. Background Gradient Contrast
- **Rule**: Avoid heavy bottom overlays (`bg-gradient-to-t from-[#030307]`) on full-body canvas views; use subtle directional vignettes (`from-black/40 via-transparent`) so character bodies and ground planes remain clearly visible.
