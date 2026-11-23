// Aturan pindah status (boleh ke mana aja + data wajib) dan eksekusi pindahnya

import type { Application, ApplicationStatus, WorkMode } from '../types/Application' // cetakan dari poin 1

// Peta "dari status X boleh pindah ke mana aja". CEKKIN LAGI sama diagram di soal!
export const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    Wishlist: ['Applied'], // dari Wishlist cuma boleh lanjut ke Applied
    Applied: ['Screening', 'Rejected'], // abis ngelamar: lolos seleksi berkas atau ditolak
    Screening: ['Interview', 'Rejected'], // abis screening: interview atau ditolak
    Interview: ['Offer', 'Rejected'], // abis interview: dapet offer atau ditolak
    Offer: [], // udah offer, nggak ada tujuan lagi
    Rejected: [], // udah ditolak, selesai
}

// Data tambahan yang diisi user pas pindah status. Semua string karena asalnya dari input form.
export interface TransitionExtra {
    cvVersion: string // dipakai pas ke Applied
    appliedDate: string // dipakai pas ke Applied
    interviewAt: string // dipakai pas ke Interview
    offerSalary: string // dipakai pas ke Offer
    workMode: WorkMode | '' // dipakai pas ke Offer ('' berarti belum dipilih)
}

// Tempat pesan error per field, boleh kosong semua
export type TransitionErrors = Partial<Record<keyof TransitionExtra, string>>

// Ngecek data wajib sesuai status tujuan. Kalau hasilnya {} berarti aman.
export function validateTransition(
    target: ApplicationStatus, // status tujuan
    extra: TransitionExtra, // isian dari form
): TransitionErrors {
    const errors: TransitionErrors = {} // wadah error

    if (target === 'Applied') {
        // ke Applied: CV dan tanggal wajib
        if (!extra.cvVersion.trim()) errors.cvVersion = 'Versi CV wajib diisi.'
        if (!extra.appliedDate) errors.appliedDate = 'Tanggal melamar wajib diisi.'
    }

    if (target === 'Interview') {
        // ke Interview: jadwal wajib
        if (!extra.interviewAt) errors.interviewAt = 'Jadwal interview wajib diisi.'
    }

    if (target === 'Offer') {
        // ke Offer: gaji harus lebih dari 0 dan mode kerja wajib
        const salary = Number(extra.offerSalary) // ubah teks jadi angka
        if (!Number.isFinite(salary) || salary <= 0) errors.offerSalary = 'Gaji offer harus lebih dari 0.'
        if (!extra.workMode) errors.workMode = 'Mode kerja wajib dipilih.'
    }

    return errors // kirim hasil cek
}

// Bikin id unik buat baris log
function makeId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID() // cara modern
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` // cadangan
}

// Eksekusi pindah status. Dipanggil HANYA kalau validateTransition udah lolos.
// Hasilnya objek BARU (immutable), objek lama nggak disentuh.
export function applyTransition(
    app: Application, // lamaran yang mau dipindah
    target: ApplicationStatus, // status tujuan
    extra: TransitionExtra, // isian dari form
): Application {
    const now = new Date().toISOString() // waktu pindahnya, dipakai buat lastUpdatedAt dan log

    return {
        ...app, // salin semua field lama
        status: target, // ganti status
        // tiga field ini cuma diganti kalau relevan sama tujuannya, sisanya tetap
        cvVersion: target === 'Applied' ? extra.cvVersion.trim() : app.cvVersion,
        appliedDate: target === 'Applied' ? extra.appliedDate : app.appliedDate,
        interviewAt: target === 'Interview' ? extra.interviewAt : app.interviewAt,
        offerSalary: target === 'Offer' ? Number(extra.offerSalary) : app.offerSalary,
        workMode: target === 'Offer' && extra.workMode ? extra.workMode : app.workMode,
        lastUpdatedAt: now, // waktu status diperbarui (dipakai Arul buat Rawan Ghosting)
        logs: [
            ...app.logs, // log lama tetap ada
            {
                id: makeId(), // id log baru
                timestamp: now, // kapan pindahnya
                message: `Status diubah dari ${app.status} ke ${target}`, // isi log otomatis
            },
        ],
    }
}