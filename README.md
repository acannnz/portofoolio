# Portofolio — I Putu Gede Candra Pratama

Portofolio interaktif bertema "mecha": pengunjung menekan **Summon**, lalu scroll untuk memutar
sequence 240 frame WebP di canvas sambil kartu identitas, skill, dan proyek muncul sebagai HUD.

## Tech stack

- **Backend:** Laravel 13, PHP 8.3+, Inertia.js
- **Frontend:** React 19, Framer Motion, Tailwind CSS v4, Vite 6
- **Rendering:** `<canvas>` 2D untuk image sequence dan particle network (tanpa library scroll tambahan)

## Struktur singkat

```
config/portfolio.php                  # SATU sumber data: profil, skill, proyek, pengalaman
routes/web.php                        # kirim config('portfolio') sebagai prop `profile`
resources/js/Pages/Home.jsx           # halaman utama
resources/js/Components/
  ScrollyExperience.jsx               # canvas + state scroll/animasi
  Scrolly/                            # IdentityPhase, SkillsPhase, ProjectsPhase, kartu, garis laser
  Sections/                           # Experience & Contact
  ParticleNetworkBackground.jsx
resources/js/hooks/useTypewriter.js
public/frames/frame_001..240.webp     # image sequence
```

## Menjalankan

```bash
composer setup        # install dependency, .env, key, migrasi, build
composer dev          # server + vite
```

## Mengubah konten

Semua teks yang tampil ada di [config/portfolio.php](config/portfolio.php). Gunakan `null`
(bukan `'#'`) untuk link yang belum ada; UI otomatis menyembunyikannya. Nilai `icon` pada skill
harus salah satu key `ICONS` di `resources/js/Components/Scrolly/constants.js`.

## Tes

```bash
composer test
```

## Catatan teknis

- Jangan beri `overflow-x: hidden` pada ancestor dari elemen `position: sticky` (canvas akan hilang).
- Frame 1–46 (intro) dimuat lebih dulu; sisanya diunduh di latar belakang setelah Summon ditekan atau
  ±3 detik setelah halaman dibuka.
- Animasi menghormati `prefers-reduced-motion`.
