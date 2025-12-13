# 🛡️ Sentinel Frontend

Selamat datang di repositori **Sentinel Frontend**. Proyek ini adalah antarmuka pengguna untuk sistem Sentinel, dibangun dengan fokus pada performa, skalabilitas, dan pengalaman pengembang yang modern.

## 🚀 Teknologi Utama

Proyek ini dibangun menggunakan serangkaian teknologi modern:

- **[React](https://react.dev/)** - Library UI untuk membangun antarmuka pengguna.
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript dengan tipe data statis yang kuat.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS _utility-first_ untuk styling yang cepat.
- **[Radix UI](https://www.radix-ui.com/)** - Komponen primitif _accessible_ (seperti yang terlihat pada komponen Avatar).
- **[Docker](https://www.docker.com/)** - Kontainerisasi untuk lingkungan pengembangan yang konsisten.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) (jika ingin menjalankan tanpa Docker)

## 🛠️ Cara Menjalankan (Docker)

Cara termudah untuk menjalankan proyek ini adalah menggunakan Docker, karena lingkungan pengembangan sudah dikonfigurasi di `docker-compose.yml`.

1.  **Clone repositori ini** (jika belum):

    ```bash
    git clone <repository-url>
    cd fe-sentinel-temp
    ```

2.  **Jalankan container**:
    Jalankan perintah berikut untuk membangun dan menyalakan layanan frontend:

    ```bash
    docker-compose up --build
    ```

3.  **Akses Aplikasi**:
    Buka browser Anda dan kunjungi http://localhost:3000.

> **Catatan:** Konfigurasi Docker menggunakan _volumes_ untuk _hot-reloading_. Perubahan yang Anda buat pada kode sumber di host akan secara otomatis diperbarui di dalam container tanpa perlu _restart_.

## 💻 Cara Menjalankan (Lokal / Tanpa Docker)

Jika Anda lebih suka menjalankan langsung di mesin lokal Anda:

1.  **Instal dependensi**:

    ```bash
    npm install
    # atau
    yarn install
    # atau
    pnpm install
    ```

2.  **Jalankan server pengembangan**:
    ```bash
    npm run dev
    ```

## 📂 Struktur Proyek

Berikut adalah gambaran singkat struktur folder penting:

```text
fe-sentinel-temp/
├── components/         # Komponen UI yang dapat digunakan kembali (misal: ui/avatar.tsx)
├── lib/                # Utilitas dan fungsi bantuan (misal: utils.ts)
├── public/             # Aset statis
├── docker-compose.yml  # Konfigurasi orkestrasi Docker
├── Dockerfile.dev      # Definisi image Docker untuk pengembangan
└── ...
```



Dibuat dengan ❤️ oleh Tim Sentinel.
