# Idle loop — panduan generate video

Saat scene mecha berhenti di titik istirahat, website akan memutar video loop pendek supaya kota di
belakangnya tetap hidup (mobil terbang, neon berkedip, lampu gedung). Begitu di-scroll, website kembali ke
frame sequence. Agar perpindahannya tidak kelihatan, **setiap klip harus mulai DAN berakhir di gambar yang
sama persis** dengan frame istirahatnya.

## Cara generate

1. Pakai tool image-to-video yang punya fitur **first frame + last frame** (keyframe awal & akhir).
2. Upload PNG yang sama ke **kedua** slot: frame awal dan frame akhir.
3. Isi prompt = **Prompt dasar** + **Tambahan** untuk klip itu. Isi negative prompt kalau tool-nya ada.
4. Durasi 5 detik, rasio 16:9, kualitas tertinggi yang tersedia, tanpa audio.
5. Generate 2–3 kali, pilih yang **karakternya paling diam** dan sambungan ujung-awalnya paling mulus.
6. Simpan sebagai MP4 ke `public/idle/` dengan nama di tabel (mis. `public/idle/rest_046.mp4`).
   Ukuran file & konversi (WebM/kompresi) nanti saya yang urus.

> Kenapa karakternya harus diam? Garis laser HUD di website menempel ke titik tubuh mecha. Kalau badannya
> bergeser di video, garisnya akan meleset. Yang boleh bergerak: latar, neon, pesawat, kilatan listrik kecil.

## Daftar klip

| Gambar awal & akhir | Simpan sebagai | Scene |
| --- | --- | --- |
| `rest_046_identity.png` | `public/idle/rest_046.mp4` | Mendarat jongkok, tangan di lantai retak (identitas) |
| `rest_116_skills.png` | `public/idle/rest_116.mp4` | Berdiri tegak (skills) |
| `rest_167_project1.png` | `public/idle/rest_167.mp4` | Armor lepas melayang, project 1 |
| `rest_188_project2.png` | `public/idle/rest_188.mp4` | Armor lepas melayang, project 2 |
| `rest_209_project3.png` | `public/idle/rest_209.mp4` | Armor + panel hologram, project 3 |
| `rest_230_project4.png` | `public/idle/rest_230.mp4` | Armor + panel hologram, project 4 |

## Prompt dasar (dipakai di semua klip)

```
Locked-off static camera: no zoom, no pan, no dolly, no camera shake. The character keeps the exact same
pose, position and framing for the whole clip; only very subtle breathing and one slow blink. The cyberpunk
city behind him is alive: flying cars and small aircraft glide slowly across the sky between the skyscrapers
with blinking navigation lights, neon signs gently flicker and pulse, building windows twinkle on and off,
thin haze drifts slowly between the towers. Same lighting, colors and 3D animated film style as the input
image. Seamless loop: the final frame is identical to the first frame.
```

## Negative prompt (semua klip)

```
camera movement, zoom, pan, shaky camera, character walking, character turning, pose change, arm movement,
head turning, face morphing, extra limbs, new objects in front of the character, changing text on signs,
whole-image flicker, color shift, brightness pulse, rain, snow, cut, transition
```

## Tambahan per klip

**rest_046 — mendarat (identitas)**

```
He stays crouched in a superhero landing with one hand planted on the cracked rooftop. Blue electric arcs
crackle softly along the cracks in the ground, flicker and settle; a few small sparks drift upward and fade.
```

**rest_116 — berdiri (skills)**

```
He stands still at the rooftop edge with relaxed fists, chest rising and falling slowly. The vertical teal,
pink and blue neon signs on the towers pulse softly; a flying car crosses far in the background.
```

**rest_167 & rest_188 — armor melayang (project 1 & 2)**

```
The detached armor plates float beside his body and bob very slightly in place. The blue electric tethers
between the plates and the suit ripple and crackle gently; the glowing blue lines on the suit pulse softly.
Small sparks float in the air.
```

**rest_209 & rest_230 — armor + hologram (project 3 & 4)**

```
The detached armor plates float beside his body and bob very slightly in place. The blue electric tethers
ripple and crackle gently. The holographic HUD panels glow, with thin scan lines sweeping across them and
their circular gauges slowly rotating. Small orange sparks drift through the air.
```

## Setelah video jadi

Video mentah dari AI disimpan di folder ini (`rest_NNN_*.mp4`, tidak di-commit). Versi untuk website dibuat
dengan ffmpeg: audio dibuang dan dikompres. Klip tetap dimulai dari gambar istirahat (detik 0), tapi 1,5 detik
terakhirnya di-crossfade ke detik 0–1,5. Jadi akhir klip sama dengan detik 1,5, dan website mengulang dari
detik 1,5 (bukan 0). Loop-nya nyambung walaupun gambar akhir dari AI tidak sama dengan gambar awal:

```bash
ffmpeg -i idle-loops/rest_116_skills.mp4 -filter_complex "[0:v]fps=24,split=3[a][b][c];[a]trim=0:1.5,setpts=PTS-STARTPTS,fps=24[head];[b]trim=start=1.5,setpts=PTS-STARTPTS,fps=24[body];[c]trim=0:1.5,setpts=PTS-STARTPTS,fps=24[tail];[body][tail]xfade=transition=fade:duration=1.5:offset=7[loop];[head][loop]concat=n=2:v=1:a=0,format=yuv420p[out]" -map "[out]" -an -c:v libx264 -preset slow -crf 27 -g 48 -force_key_frames "0,1.5" -movflags +faststart public/idle/rest_116.mp4
```

`offset` = durasi klip − 3 (untuk klip 10 detik: 7). Website memutar klip ini lewat
`resources/js/Components/Scrolly/IdleLoop.jsx` saat scene berhenti di frame istirahatnya.
