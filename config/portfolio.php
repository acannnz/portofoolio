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
            // Client system, so no screenshots: render a live 3D module map instead (see Scrolly/visuals.js)
            'visual' => 'clinic-network',
            // Projects with a slug + case_study get their own page at /projects/{slug}
            'slug' => 'sistem-klinik',
            'case_study' => [
                'role' => 'Full Stack Developer',
                'period' => '2025 — Sekarang',
                'client' => 'Klinik & praktik dokter',
                'summary' => 'Sistem informasi klinik berbasis web yang dipakai setiap hari oleh klinik dan praktik dokter, mulai dari pasien mendaftar sampai membayar di kasir. Satu basis kode melayani banyak unit klinik, masing-masing dengan konfigurasi dan database sendiri. Saya mengembangkan dan menyesuaikan modul sesuai kebutuhan tiap klien, serta memperbaiki masalah yang langsung berdampak ke pelayanan pasien.',
                'stats' => [
                    ['value' => 'Ratusan', 'label' => 'klinik & tenaga medis pengguna'],
                    ['value' => '6', 'label' => 'modul yang saya kerjakan'],
                    ['value' => 'Multi-unit', 'label' => 'satu basis kode, banyak klinik'],
                    ['value' => 'Real-time', 'label' => 'e-resep dari dokter ke farmasi'],
                ],
                'challenges' => [
                    [
                        'title' => 'Satu sistem, banyak unit',
                        'body' => 'Satu basis kode melayani beberapa unit klinik dalam satu instansi sekaligus praktik dokter mandiri, masing-masing dengan konfigurasi dan database sendiri.',
                    ],
                    [
                        'title' => 'Alur klinis tidak boleh tersendat',
                        'body' => 'Registrasi, pemeriksaan, resep, dan kasir berjalan berurutan. Satu form yang macet berarti antrean pasien ikut berhenti.',
                    ],
                    [
                        'title' => 'Kebutuhan tiap klien berbeda',
                        'body' => 'Field wajib, layanan default, sampai alur pemeriksaan disesuaikan per klien tanpa merusak alur unit lain.',
                    ],
                ],
                'modules' => [
                    ['code' => 'REG', 'title' => 'Registrasi & antrean', 'body' => 'Pendaftaran pasien dan antrean poli, dengan field wajib yang bisa disederhanakan per klien agar pendaftaran lebih cepat.'],
                    ['code' => 'POLI', 'title' => 'Rawat jalan & EMR (SOAP)', 'body' => 'Asesmen dokter dan perawat dengan rekam medis SOAP. Riwayat dan tanda vital diteruskan dari registrasi ke modul dokter.'],
                    ['code' => 'E-RX', 'title' => 'E-resep & farmasi', 'body' => 'Resep elektronik dari dokter ke farmasi, diperbarui secara real-time lewat WebSocket.'],
                    ['code' => 'KASIR', 'title' => 'Kasir & billing', 'body' => 'Rekap total tagihan tindakan rawat jalan dan komponen tarif layanan sampai pembayaran di kasir.'],
                    ['code' => 'LOG', 'title' => 'Logistik & stock opname', 'body' => 'Pengadaan, penerimaan, distribusi antar-unit, pemakaian barang, dan stock opname dengan alur Draft lalu Posting.'],
                    ['code' => 'RPT', 'title' => 'Laporan & dashboard', 'body' => 'Laporan nilai persediaan dengan kartu KPI, rincian per kategori, cetak, dan export Excel.'],
                ],
                'highlights' => [
                    [
                        'title' => 'Form e-resep yang macet',
                        'problem' => 'Setelah resep disimpan, form kadang tidak menutup dan loading berputar terus.',
                        'solution' => 'Notifikasi WebSocket dikirim tanpa memastikan koneksi terbuka, sehingga memicu error JavaScript sebelum modal ditutup. Saya tambahkan pengecekan status koneksi dan penanganan error, lalu memastikan modal dan loader selalu dibersihkan.',
                    ],
                    [
                        'title' => 'Stock opname yang bisa diaudit',
                        'problem' => 'Selisih stok fisik dan sistem harus tercatat tanpa langsung mengubah stok saat masih dihitung.',
                        'solution' => 'Alur Draft lalu Posting dengan penomoran YYMM-OPNLOG-XXXXXX. Saat posting, stok disinkronkan dan selisihnya dicatat ke kartu gudang.',
                    ],
                    [
                        'title' => 'Layanan default yang muncul lagi',
                        'problem' => 'Layanan default seperti konsultasi dokter umum muncul kembali di tagihan meski sudah dihapus petugas.',
                        'solution' => 'Layanan default kini hanya diisi otomatis di tampilan untuk pemeriksaan baru. Backend tidak lagi menyisipkannya paksa saat data disimpan atau diubah.',
                    ],
                    [
                        'title' => 'Error tarif dari SQL Server',
                        'problem' => 'Pengambilan komponen tarif layanan gagal dengan error SQL ketika daftar harga pasien kosong.',
                        'solution' => 'Query diubah memakai parameter terikat dan validasi fallback daftar harga, sehingga function SQL Server selalu menerima argumen yang valid.',
                    ],
                ],
                'stack' => ['PHP', 'CodeIgniter 3 HMVC', 'SQL Server', 'jQuery', 'WebSocket', 'Bootstrap'],
            ],
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
