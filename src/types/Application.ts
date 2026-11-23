//  Skema data satu lamaran, dipakai bertiga

// Membuat daftar status sebagai array tetap yang tidak bisa diubah
export const APPLICATION_STATUSES = [
    'Wishlist', // belum melamar, baru disimpan
    'Applied', // sudah mengirim lamaran
    'Screening', // sedang diseleksi berkas
    'Interview', // sudah dijadwalkan interview
    'Offer', // sudah mendapat tawaran
    'Rejected', // ditolak
] as const // "as const" mengunci isi array supaya jadi tipe literal

// Membuat tipe dari isi array di atas: 'Wishlist' | 'Applied' | ...
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// Daftar mode kerja, cara kerjanya sama seperti status
export const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'] as const

// Tipe mode kerja: 'Remote' | 'Hybrid' | 'Onsite'
export type WorkMode = (typeof WORK_MODES)[number]

// Cetakan satu butir tugas di checklist
export interface ChecklistItem {
    id: string // pengenal unik, dipakai saat centang atau hapus
    text: string // isi tugas, misalnya "Siapkan CV"
    done: boolean // true berarti sudah dicentang
}

// Cetakan satu baris riwayat aktivitas
export interface ActivityLog {
    id: string // pengenal unik tiap log
    timestamp: string // waktu kejadian, format ISO
    message: string // isi log, misalnya "Status diubah ke Applied"
}

// Cetakan utama: satu objek Application = satu lamaran
export interface Application {
    id: string // pengenal unik lamaran
    company: string // nama perusahaan, juga dipakai katalog Nadia
    role: string // posisi yang dilamar, juga dipakai katalog Nadia
    status: ApplicationStatus // tahap lamaran saat ini, harus salah satu dari daftar status

    workMode: WorkMode | null // mode kerja, wajib terisi saat Offer
    cvVersion: string | null // versi CV, wajib terisi saat Applied
    appliedDate: string | null // tanggal melamar, wajib terisi saat Applied
    interviewAt: string | null // jadwal interview, wajib terisi saat Interview
    offerSalary: number | null // gaji offer, wajib lebih dari 0 saat Offer

    lastUpdatedAt: string // waktu status terakhir berubah, dipakai Arul untuk Rawan Ghosting

    checklist: ChecklistItem[] // daftar tugas milik lamaran ini
    logs: ActivityLog[] // riwayat aktivitas milik lamaran ini
}