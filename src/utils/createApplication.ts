// satu fungsi pembuatan lamaran yang dipakai bersama
// form manual dan tombol Simpan ke Wishlist 

// Mengambil tipe dari skema poin 1 (type-only, tidak ikut ke hasil build)
import type { Application, WorkMode } from '../types/Application'

// Data yang dikirim pemanggil (form atau katalog) untuk membuat lamaran baru
export interface NewApplicationInput {
    company: string // nama perusahaan
    role: string // posisi yang dilamar
    status: 'Wishlist' | 'Applied' // status awal hanya boleh dua ini
    cvVersion?: string | null // wajib diisi kalau status awal Applied
    appliedDate?: string | null // wajib diisi kalau status awal Applied
    workMode?: WorkMode | null // opsional saat membuat lamaran
    requiredSkills?: string[] // skill lowongan
}

// Hasil fungsi: berhasil membawa lamaran baru, gagal membawa pesan error
export type CreateApplicationResult =
    | { ok: true; application: Application }
    | { ok: false; error: string }

// Menyamakan tulisan supaya "Google" dan " google " dianggap sama
function normalize(text: string) {
    return text.trim().toLowerCase() // hapus spasi tepi, lalu huruf kecil semua
}

// Membuat id unik untuk lamaran dan log
function makeId() {
    // randomUUID tersedia di browser modern (aman di localhost)
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
    }
    // cadangan kalau randomUUID tidak ada: waktu sekarang + angka acak
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Mengecek apakah pasangan perusahaan + posisi sudah ada di daftar lamaran
export function isDuplicateApplication(
    existing: Pick<Application, 'company' | 'role'>[], // cukup butuh dua field ini
    company: string, // perusahaan yang mau dicek
    role: string, // posisi yang mau dicek
) {
    // some() = true kalau ada minimal satu lamaran yang cocok
    return existing.some(
        (item) =>
            normalize(item.company) === normalize(company) && // perusahaan sama
            normalize(item.role) === normalize(role), // dan posisi sama
    )
}

// Fungsi utama: membuat satu lamaran baru, atau menolak dengan pesan error
export function createApplication(
    existing: Application[], // daftar lamaran yang sudah ada, untuk cek duplikat
    input: NewApplicationInput, // data lamaran baru
): CreateApplicationResult {
    const company = input.company.trim() // buang spasi di tepi nama perusahaan
    const role = input.role.trim() // buang spasi di tepi nama posisi

    // Perusahaan dan posisi tidak boleh kosong
    if (!company || !role) {
        return { ok: false, error: 'Perusahaan dan posisi wajib diisi.' }
    }

    // Tolak kalau pasangan perusahaan + posisi sudah ada (huruf besar/kecil diabaikan)
    if (isDuplicateApplication(existing, company, role)) {
        return { ok: false, error: 'Lamaran untuk perusahaan dan posisi ini sudah ada.' }
    }

    // Status awal Applied wajib membawa versi CV dan tanggal melamar
    if (input.status === 'Applied' && (!input.cvVersion?.trim() || !input.appliedDate)) {
        return { ok: false, error: 'Status Applied wajib mengisi versi CV dan tanggal melamar.' }
    }

    const now = new Date().toISOString() // satu waktu dipakai untuk lamaran dan log pertama

    // Merakit objek lamaran sesuai skema Application
    const application: Application = {
        id: makeId(), // id unik lamaran
        company, // nama perusahaan yang sudah dirapikan
        role, // nama posisi yang sudah dirapikan
        requiredSkills: input.requiredSkills?.map((skill) => skill.trim()).filter(Boolean) ?? [],
        status: input.status, // Wishlist atau Applied
        workMode: input.workMode ?? null, // kalau tidak diisi, jadi null
        cvVersion: input.status === 'Applied' ? input.cvVersion!.trim() : null, // hanya terisi kalau Applied
        appliedDate: input.status === 'Applied' ? input.appliedDate! : null, // hanya terisi kalau Applied
        interviewAt: null, // belum ada jadwal interview
        offerSalary: null, // belum ada offer
        lastUpdatedAt: now, // waktu status dimulai (dipakai Rawan Ghosting)
        checklist: [], // checklist masih kosong
        logs: [
            {
                id: makeId(), // id unik log pertama
                timestamp: now, // waktu lamaran dibuat
                message: `Lamaran dibuat dengan status ${input.status}`, // log pertama sesuai soal
            },
        ],
    }

    return { ok: true, application } // kirim lamaran baru ke pemanggil
}