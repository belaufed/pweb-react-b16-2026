# Catatan Perubahan & Perbaikan Proyek (`perubahan.md`)

Dokumen ini berisi rincian seluruh perubahan yang dilakukan untuk **merapikan layout web** dan **menyesuaikan fitur dengan spesifikasi `Soal Praktikum Modul 5.pdf`**, lengkap dengan pemetaan PIC masing-masing anggota kelompok sesuai `pembagian.md`.

---

## A. Perbaikan Fungsional (Kesesuaian Spesifikasi Modul 5)

### 1. Input "Mode Kerja" pada Form Tambah Lamaran Manual (PIC: Dyfan)
- **File:** `src/components/ManualApplicationForm.tsx`
- **Alasan:** Spesifikasi Fitur 2 di PDF mengharuskan form manual memiliki input terkontrol: *Perusahaan, Posisi/Role, **Mode Kerja**, Status Awal (`Wishlist` / `Applied`), dan Required Skills*. Sebelumnya input Mode Kerja belum ada di form meskipun fungsi `createApplication.ts` sudah mendukung `workMode`.
- **Perubahan:**
  - Menambahkan state terkontrol `workMode` (`useState<WorkMode | ''>('')`).
  - Menambahkan dropdown `<select>` **Mode Kerja** dengan opsi `Remote`, `Hybrid`, dan `Onsite` (mengambil dari konstanta `WORK_MODES` di `src/types/Application.ts`).
  - Mengirimkan `workMode: workMode || null` ke `createApplication(...)` saat submit dan mereset kembali ke `''` setelah berhasil.

### 2. Transisi Status ke `Ghosted` pada State Machine (PIC: Dyfan)
- **File:** `src/utils/statusTransition.ts`
- **Alasan:** Sebelumnya di `allowedTransitions`, status `Ghosted` dapat kembali ke `Screening` (`Ghosted: ['Screening']`), tetapi belum ada satu pun status yang memiliki tujuan `'Ghosted'`. Sesuai wireframe halaman 7 pada PDF soal, dari status `Interview` pengguna dapat berpindah ke `Offer`, `Rejected`, atau `Ghosted`.
- **Perubahan:**
  - Mengubah `Interview: ['Offer', 'Rejected']` menjadi `Interview: ['Offer', 'Rejected', 'Ghosted']`.

### 3. Visual Progress Bar pada Checklist (PIC: Dyfan)
- **File:** `src/components/Checklist.tsx`, `src/styles/application.css`
- **Alasan:** Spesifikasi Fitur 4 di PDF menyebutkan *"lengkap dengan progress bar (X/Y selesai)"*. Sebelumnya hanya menampilkan teks `Progress: X/Y`.
- **Perubahan:**
  - Menambahkan elemen `<progress className="checklist-progress" value={doneCount} max={Math.max(total, 1)} />` tepat di bawah teks `Progress: X/Y`.

### 4. Default Sumber Data Katalog ke `Live API` (PIC: Nadia)
- **File:** `src/components/JobCatalog.tsx`
- **Alasan:** Pada **Testcase 1** (*Fetch & Offline Error: DevTools -> Offline dan klik Retry -> muncul pesan error + tombol fallback lokal*), tombol `"Pakai Fallback Lokal"` hanya muncul apabila `source === 'api'`.
- **Perubahan:**
  - Mengubah nilai awal state `source` dari `useState<JobSource>('local')` menjadi `useState<JobSource>('api')`.

### 5. Judul Halaman Browser (PIC: Nadia)
- **File:** `index.html`
- **Perubahan:**
  - Mengubah `<title>pweb-react-p01-2026</title>` menjadi `<title>Aku Mw Magang</title>`.

---

## B. Perapihan Layout & Styling (UI/UX Responsif)

Seluruh perubahan layout dilakukan **tanpa mengubah teks label, teks tombol, maupun atribut `role`/`aria-*`** sehingga semua testcase otomatis tetap berjalan normal.

### 1. Reset Layout Global & Tema Warna
- **File:** `src/index.css`
- **Perubahan:**
  - Menghapus `text-align: center` dan `width: 1126px` bawaan template Vite pada `#root` yang sebelumnya membuat teks, form, dan list di beberapa komponen menjadi rata tengah.
  - Mengatur container `#root` menjadi `max-width: 1240px` dengan padding responsif dan variabel warna permukaan (`--surface`, `--surface-subtle`, `--border`, `--accent`) yang mendukung Light Mode & Dark Mode (`prefers-color-scheme: dark`).

### 2. Header Aplikasi & Navigasi Utama (PIC: Arul)
- **File:** `src/App.tsx`, `src/styles/application.css`
- **Perubahan:**
  - Membungkus judul `Aku Mw Magang` dan `<nav className="app-nav">` ke dalam `<header className="app-header">`.
  - Menambahkan class `is-active` dan `aria-current="page"` pada tombol tab navigasi yang sedang aktif (`Eksplorasi`, `War Room`, `Dashboard`).
  - Menyusun halaman **Eksplorasi** agar `SkillProfile` dan `ManualApplicationForm` tampil berdampingan dalam grid 2 kolom (`.explore-top-grid`) di atas `JobCatalog`.

### 3. Tampilan Profil Skill, Katalog, dan Kartu Lowongan (PIC: Nadia)
- **File:** `src/components/SkillProfile.tsx`, `src/components/JobCatalog.tsx`, `src/components/JobCard.tsx`, `src/styles/application.css`
- **Perubahan:**
  - **Profil Skill Kapten:** Input tambah skill dan tombol `Tambah skill` disusun sebaris (`.input-action-row`), serta daftar skill ditampilkan sebagai *pill/chip* rapi (`.skill-chip-list` & `.skill-chip`).
  - **Eksplorasi Lowongan:** Filter *Sumber data*, *Cari lowongan*, dan *Kategori* disusun dalam satu baris toolbar responsif (`.catalog-controls`), sedangkan daftar lowongan disusun dalam grid kartu responsif (`.job-grid`).
  - **Kartu Lowongan (`JobCard`):** Header kartu memisahkan judul/perusahaan di kiri dan badge `Match X%` di kanan atas (`.job-card-header`), diikuti rincian lokasi, gaji, skill cocok/kurang, dan tombol aksi penuh di bagian bawah.

### 4. Tampilan War Room, Detail Lamaran, Checklist, Log, & Timer (PIC: Arul, Dyfan, Nadia)
- **File:** `src/components/WarRoom.tsx`, `src/components/ApplicationDetail.tsx`, `src/components/Checklist.tsx`, `src/components/ActivityLogPanel.tsx`, `src/components/InterviewPrepTimer.tsx`, `src/styles/application.css`
- **Perubahan:**
  - **War Room (`WarRoom.tsx`):** Kartu lamaran dilengkapi header perusahaan + badge `Rawan Ghosting`, kotak ringkasan metrik 2 kolom (`.application-card-details` untuk Status, CV, Checklist, Skill Match), serta deretan tombol aksi di bagian bawah (`.application-card-actions`) dengan warna merah untuk tombol `Hapus` (`.danger-button`).
  - **Detail Lamaran (`ApplicationDetail.tsx`):** Ringkasan informasi lamaran disusun dalam grid (`.detail-meta-grid`), serta komponen **Checklist** dan **Riwayat Aktivitas** ditempatkan berdampingan dalam 2 kolom sub-panel (`.detail-columns` & `.detail-subcard`).
  - **Latihan Interview (`InterviewPrepTimer.tsx`):** Dibungkus dalam kartu `.interview-timer-card` dengan angka *countdown* monospace berukuran besar (`.timer-display`) dan grup tombol kontrol yang rapi.

---

## C. Ringkasan File yang Diubah per PIC

| Anggota (PIC) | File yang Diubah | Ringkasan Perubahan |
| :--- | :--- | :--- |
| **Nadia** | `index.html`<br>`src/components/SkillProfile.tsx`<br>`src/components/JobCatalog.tsx`<br>`src/components/JobCard.tsx`<br>`src/components/InterviewPrepTimer.tsx` | • Judul tab `Aku Mw Magang`.<br>• Default sumber data katalog ke `Live API` (`'api'`).<br>• Chip list pada Profil Skill, toolbar filter & grid kartu pada Katalog, layout `JobCard`, dan kartu `InterviewPrepTimer`. |
| **Dyfan** | `src/components/ManualApplicationForm.tsx`<br>`src/utils/statusTransition.ts`<br>`src/components/ApplicationDetail.tsx`<br>`src/components/Checklist.tsx`<br>`src/components/ActivityLogPanel.tsx` | • Tambah dropdown `Mode Kerja` di form manual.<br>• Tambah transisi `Interview -> Ghosted` di `allowedTransitions`.<br>• Tambah elemen `<progress>` visual di `Checklist`.<br>• Grid metadata & layout 2 kolom di `ApplicationDetail`. |
| **Arul** | `src/App.tsx`<br>`src/components/WarRoom.tsx`<br>`src/index.css`<br>`src/styles/application.css` | • Header navigasi dengan indikator tab aktif & grid halaman di `App.tsx`.<br>• Struktur kartu lamaran di `WarRoom.tsx`.<br>• Perapihan menyeluruh `index.css` & `application.css`. |
