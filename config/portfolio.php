<?php

/*
 * Single source of truth for everything shown on the portfolio page.
 * Sent to the Home page as the `profile` Inertia prop.
 *
 * `icon` values must match a key of ICONS in resources/js/Components/Scrolly/constants.js.
 * Use `null` (not '#') for links that do not exist yet; the UI hides them.
 */

return [
    'name' => 'I PUTU GEDE CANDRA PRATAMA',
    'role' => 'Fullstack Developer',
    'age' => '23 Years Old',
    'location' => 'Jembrana, Bali',
    'avatar' => '/images/profile.webp',
    'about' => 'Software Engineer berpengalaman dalam merancang & membangun aplikasi web modern yang cepat, skalabel, serta berantarmuka intuitif.',
    'stack' => 'Laravel • React • Node',
    'availability' => 'Available for Hire',

    // Contact section links; each button is hidden while its value is empty.
    'contact' => [
        'email' => 'putu.candra689@gmail.com',
        'github' => 'https://github.com/acannnz',
    ],

    'skills' => [
        [
            'name' => 'Laravel, PHP, Golang',
            'category' => 'Backend',
            'serial' => 'MOD_01 // BACKEND',
            'status' => 'CORE_ENGINE',
            'tags' => ['Laravel', 'PHP', 'Golang'],
            'icon' => 'Server',
        ],
        [
            'name' => 'React & Next.js',
            'category' => 'Frontend',
            'serial' => 'MOD_02 // FRONTEND',
            'status' => 'INTERFACE',
            'tags' => ['React.js', 'Next.js', 'Framer Motion'],
            'icon' => 'Code2',
        ],
        [
            'name' => 'PostgreSQL, MySQL, SQL Server',
            'category' => 'Database',
            'serial' => 'MOD_03 // DATABASE',
            'status' => 'DATA_CORE',
            'tags' => ['PostgreSQL', 'MySQL', 'SQL Server'],
            'icon' => 'Database',
        ],
        [
            'name' => 'TailwindCSS & UI/UX',
            'category' => 'Design',
            'serial' => 'MOD_04 // DESIGN',
            'status' => 'VISUAL_SYSTEM',
            'tags' => ['TailwindCSS', 'Cyberpunk HUD', 'UI/UX'],
            'icon' => 'Zap',
        ],
        [
            'name' => 'REST API & WebSockets',
            'category' => 'Architecture',
            'serial' => 'MOD_05 // ARCHITECTURE',
            'status' => 'NETWORKING',
            'tags' => ['RESTful API', 'WebSockets', 'Real-time'],
            'icon' => 'Network',
        ],
        [
            'name' => 'Git & Docker',
            'category' => 'DevOps',
            'serial' => 'MOD_06 // DEVOPS',
            'status' => 'DEPLOYMENT',
            'tags' => ['Git Flow', 'Docker Container', 'CI/CD'],
            'icon' => 'Terminal',
        ],
    ],

    'projects' => [
        [
            'id' => 4,
            'title' => 'Tokosendiri — Multi-Tenant SaaS E-Commerce',
            'description' => 'Platform SaaS satu aplikasi banyak toko: katalog, pesanan, pelanggan, analitik, langganan berbasis kuota, pembayaran Midtrans (Snap/QRIS), dan storefront publik per tenant.',
            'tags' => ['Laravel 13', 'PostgreSQL Multi-Tenant', 'React + TypeScript', 'Sanctum', 'Midtrans Snap'],
            'github' => 'https://github.com/acannnz/Saas-landingpage',
            'demo' => 'https://tokosendiri.my.id/',
            'image' => '/images/tokosendiri_landing.webp',
        ],
        [
            'id' => 5,
            'title' => 'Sistem Informasi Klinik & Praktik Dokter',
            'description' => 'Studi kasus sistem klinik multi-unit yang dipakai klinik dan praktik dokter: registrasi pasien, rawat jalan dengan rekam medis elektronik (SOAP), e-resep farmasi real-time, laboratorium, kasir/billing, hingga logistik dan stock opname.',
            'tags' => ['CodeIgniter HMVC', 'SQL Server', 'jQuery', 'WebSocket', 'EMR / SOAP'],
            'github' => null,
            'demo' => null,
            'image' => null,
            // Client system, so no screenshots: render a live 3D module map instead (see ProjectShard VISUALS)
            'visual' => 'clinic-network',
        ],
        [
            'id' => 1,
            'title' => 'Angry Birds 3D Web Game',
            'description' => 'Game 3D ketapel interaktif dengan simulasi fisika trajektori gravitasi (Rapier), peruntuhan struktur balok es/kayu/batu, dan WebGL Three.js.',
            'tags' => ['Three.js', 'React Three Fiber', 'Rapier Physics', 'Zustand'],
            'github' => 'https://github.com/acannnz/angry_bird',
            'demo' => 'https://burungngamuk.arcand.my.id/',
            'image' => '/images/angry_birds.webp',
        ],
        [
            'id' => 2,
            'title' => 'Real-Time Audio Sync Platform',
            'description' => 'Platform dengerin lagu bareng dengan sinkronisasi clock master presisi tinggi dan kontrol audio cross-device.',
            'tags' => ['Flutter Web', 'WebSockets', 'Go / Node'],
            'github' => null,
            'demo' => null,
            'image' => null,
        ],
        [
            'id' => 3,
            'title' => 'SSO Identity Hub & Application Launcher',
            'description' => 'Sistem otentikasi terpusat Single Sign-On berbasis OIDC dengan fitur perizinan pengguna dinamis.',
            'tags' => ['Laravel', 'OAuth2/OIDC', 'React'],
            'github' => null,
            'demo' => null,
            'image' => null,
        ],
    ],

    'experience' => [
        [
            'role' => 'Full Stack Developer',
            'company' => 'PT Sanata System',
            'division' => null,
            'period' => '2025 — Present',
            'current' => true,
            'highlights' => [
                'Developed, maintained, and scaled web-based healthcare applications utilized by hundreds of clinics and medical professionals.',
                'Built and customized end-to-end modules, including patient registration, outpatient services, pharmacy, cashier systems, and analytical reporting dashboards.',
                'Integrated frontend interfaces with backend services and optimized SQL Server/Database queries for faster data processing.',
                'Implemented responsive layouts and user-centric workflows based on complex client requirements.',
                'Collaborated directly with stakeholders and clients to gather requirements, perform training, and improve overall application usability.',
                'Currently developing an Accreditation Management System leveraging modern web technologies such as Node.js and React.js to enhance system scalability.',
            ],
        ],
        [
            'role' => 'Full Stack Web Developer — Internship',
            'company' => 'Dinas Kominfo Kabupaten Jembrana',
            'division' => 'Infrastructure and Application Division',
            'period' => '2024',
            'current' => false,
            'highlights' => [
                'Developed a web-based application for recording and monitoring government employee activities to improve internal operational efficiency.',
                'Designed and built user interfaces and core system features using Laravel for government internal operations.',
                'Participated in the full software development life cycle (SDLC), covering application development, testing, and on-site deployment.',
            ],
        ],
    ],
];
