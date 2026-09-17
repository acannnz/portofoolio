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
            'skills' => [
                ['name' => 'Laravel & PHP', 'category' => 'Backend', 'level' => 'Advanced'],
                ['name' => 'React & Next.js', 'category' => 'Frontend', 'level' => 'Advanced'],
                ['name' => 'PostgreSQL & MySQL', 'category' => 'Database', 'level' => 'Intermediate'],
                ['name' => 'TailwindCSS & UI/UX', 'category' => 'Design', 'level' => 'Advanced'],
                ['name' => 'REST API & WebSockets', 'category' => 'Architecture', 'level' => 'Advanced'],
                ['name' => 'Git & Docker', 'category' => 'DevOps', 'level' => 'Intermediate'],
            ],
            'projects' => [
                [
                    'id' => 1,
                    'title' => 'Sistem Informasi Preskripsi & Farmasi',
                    'description' => 'Aplikasi manajemen stok obat real-time dan sistem preskripsi pasien terintegrasi dengan penanganan validasi transaksi.',
                    'tags' => ['Laravel', 'PostgreSQL', 'TailwindCSS'],
                    'github' => '#',
                    'demo' => '#',
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
