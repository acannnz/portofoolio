<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'profile' => [
            'name' => 'I PUTU GEDE CANDRA PRATAMA',
            'role' => 'Fullstack Developer',
            'age' => '23 Years Old',
            'location' => 'Jembrana, Bali',
            'avatar' => '/images/profile.webp',
            'about' => 'Software Engineer berpengalaman dalam merancang & membangun aplikasi web modern yang cepat, skalabel, serta berantarmuka intuitif.',
            'contact' => [
                'email' => 'putu.candra689@gmail.com',
                'github' => 'https://github.com/acannnz',
            ],
            'skills' => [
                ['name' => 'Laravel, PHP, Golang', 'category' => 'Backend'],
                ['name' => 'React & Next.js', 'category' => 'Frontend'],
                ['name' => 'PostgreSQL, MySQL, SQL Server', 'category' => 'Database'],
                ['name' => 'TailwindCSS & UI/UX', 'category' => 'Design'],
                ['name' => 'REST API & WebSockets', 'category' => 'Architecture'],
                ['name' => 'Git & Docker', 'category' => 'DevOps'],
            ],
            'projects' => [
                [
                    'id' => 4,
                    'title' => 'Tokosendiri — Multi-Tenant SaaS E-Commerce',
                    'description' => 'Platform SaaS satu aplikasi banyak toko: katalog, pesanan, pelanggan, analitik, langganan berbasis kuota, pembayaran Midtrans (Snap/QRIS), dan storefront publik per tenant.',
                    'tags' => ['Laravel 13', 'PostgreSQL Multi-Tenant', 'React + TypeScript', 'Sanctum', 'Midtrans Snap'],
                    'github' => 'https://github.com/acannnz/Saas-landingpage',
                    'demo' => 'https://tokosendiri.my.id/',
                    'image' => '/images/saas_products.webp',
                    'featured' => true
                ],
                [
                    'id' => 1,
                    'title' => 'Angry Birds 3D Web Game',
                    'description' => 'Game 3D ketapel interaktif dengan simulasi fisika trajektori gravitasi (Rapier), peruntuhan struktur balok es/kayu/batu, dan WebGL Three.js.',
                    'tags' => ['Three.js', 'React Three Fiber', 'Rapier Physics', 'Zustand'],
                    'github' => 'https://github.com/acannnz/angry_bird',
                    'demo' => 'https://burungngamuk.arcand.my.id/',
                    'image' => '/images/angry_birds.webp',
                    'featured' => true
                ],
                [
                    'id' => 2,
                    'title' => 'Real-Time Audio Sync Platform',
                    'description' => 'Platform dengerin lagu bareng dengan sinkronisasi clock master presisi tinggi dan kontrol audio cross-device.',
                    'tags' => ['Flutter Web', 'WebSockets', 'Go / Node'],
                    'github' => '#',
                    'demo' => '#',
                    'featured' => true
                ],
                [
                    'id' => 3,
                    'title' => 'SSO Identity Hub & Application Launcher',
                    'description' => 'Sistem otentikasi terpusat Single Sign-On berbasis OIDC dengan fitur perizinan pengguna dinamis.',
                    'tags' => ['Laravel', 'OAuth2/OIDC', 'React'],
                    'github' => '#',
                    'demo' => '#',
                    'featured' => true
                ],
            ]
        ]
    ]);
});
