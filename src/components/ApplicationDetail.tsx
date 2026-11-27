// Halaman detail satu lamaran + form pindah status
// Poin 5 (checklist) dan poin 6 (log + timer) nanti nempel di sini

import { useState } from 'react' // buat nyimpen isian form
import type { Application, ApplicationStatus, WorkMode } from '../types/Application' // cetakan dari poin 1
import { WORK_MODES } from '../types/Application' // daftar mode kerja buat dropdown
import {
    allowedTransitions, // peta tujuan yang boleh
    applyTransition, // eksekusi pindah status
    validateTransition, // cek data wajib
    type TransitionErrors, // tipe error
    type TransitionExtra, // tipe isian
} from '../utils/statusTransition'
import { Checklist } from './Checklist' // {Dyfan} (poin 5) komponen checklist
import { ActivityLogPanel } from './ActivityLogPanel' // {Dyfan} (poin 6) riwayat aktivitas + catatan manual
import { InterviewPrepTimer } from './InterviewPrepTimer' // {Dyfan} (poin 6) timer buatan Nadia, tinggal dipasang

// Props: lamaran yang ditampilin + fungsi buat ngabarin App kalau lamarannya berubah
interface ApplicationDetailProps {
    application: Application
    onChange: (updated: Application) => void
}

export function ApplicationDetail({ application, onChange }: ApplicationDetailProps) {
    // Tujuan yang boleh dipilih dari status sekarang
    const options = allowedTransitions[application.status]

    //  State form (controlled) 
    const [target, setTarget] = useState<ApplicationStatus | ''>('') // tujuan yang dipilih, '' = belum milih
    const [extra, setExtra] = useState<TransitionExtra>({
        cvVersion: application.cvVersion ?? '', // isi awal ambil dari data lama kalau ada
        appliedDate: application.appliedDate ?? '',
        interviewAt: application.interviewAt ?? '',
        offerSalary: application.offerSalary ? String(application.offerSalary) : '',
        workMode: application.workMode ?? '',
    })
    const [errors, setErrors] = useState<TransitionErrors>({}) // pesan error per field
    // {Dyfan} (poin 6) timer tampil atau nggak. Pas ditutup, komponen timer dilepas React jadi intervalnya ikut berhenti
    const [showTimer, setShowTimer] = useState(false)

    // Update satu field di extra tanpa ngubah field lainnya
    function setField<K extends keyof TransitionExtra>(key: K, value: TransitionExtra[K]) {
        setExtra((current) => ({ ...current, [key]: value })) // salin yang lama, timpa satu field
    }

    // Dipanggil pas tombol Ubah Status diklik
    function handleMove() {
        if (!target) {
            // belum milih tujuan sama sekali
            setErrors({}) // bersihin error lama
            return
        }

        const found = validateTransition(target, extra) // cek data wajib
        if (Object.keys(found).length > 0) {
            // ada yang kurang
            setErrors(found) // tampilin pesan error
            return // stop, status nggak berubah
        }

        onChange(applyTransition(application, target, extra)) // aman, kirim versi baru ke App
        setTarget('') // balikin dropdown ke kosong
        setErrors({}) // hapus error
    }

    // Format tanggal ISO jadi tampilan lokal, kalau kosong tampil strip
    function showDate(value: string | null) {
        return value ? new Date(value).toLocaleString('id-ID') : '-'
    }

    return (
        <section className="application-panel application-detail">
            <h2>Detail Lamaran</h2>

            {/* Ringkasan data lamaran */}
            <div className="detail-summary">
                <p className="detail-headline"><strong>{application.company}</strong> - {application.role}</p>
                <div className="detail-meta-grid">
                    <p>Status: <strong>{application.status}</strong></p>
                    <p>Versi CV: {application.cvVersion ?? '-'}</p>
                    <p>Tanggal melamar: {application.appliedDate ?? '-'}</p>
                    <p>Jadwal interview: {showDate(application.interviewAt)}</p>
                    <p>
                        Gaji offer: {application.offerSalary ? application.offerSalary.toLocaleString('id-ID') : '-'}
                    </p>
                    <p>Mode kerja: {application.workMode ?? '-'}</p>
                    <p>Terakhir diperbarui: {showDate(application.lastUpdatedAt)}</p>
                </div>
            </div>

            <div className="detail-section">
                <h3>Ubah Status</h3>

                {options.length === 0 ? (
                    // status akhir, nggak ada tujuan lagi
                    <p>Tidak ada perpindahan status lagi dari {application.status}.</p>
                ) : (
                    <div className="status-transition-form">
                        <p>
                            <label>
                                Pindah ke{' '}
                                <select
                                    value={target}
                                    onChange={(event) => {
                                        // cari tujuan yang cocok di daftar options, kalau nggak ada berarti ''
                                        const picked = options.find((option) => option === event.target.value)
                                        setTarget(picked ?? '')
                                        setErrors({}) // ganti tujuan, error lama dibuang
                                    }}
                                >
                                    <option value="">Pilih status tujuan</option>
                                    {options.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        </p>

                        {/* Field ini muncul sesuai tujuan yang dipilih */}
                        {target === 'Applied' && (
                            <>
                                <p>
                                    <label>
                                        Versi CV{' '}
                                        <input
                                            value={extra.cvVersion}
                                            onChange={(event) => setField('cvVersion', event.target.value)}
                                        />
                                    </label>
                                    {errors.cvVersion && <span role="alert"> {errors.cvVersion}</span>}
                                </p>
                                <p>
                                    <label>
                                        Tanggal melamar{' '}
                                        <input
                                            type="date"
                                            value={extra.appliedDate}
                                            onChange={(event) => setField('appliedDate', event.target.value)}
                                        />
                                    </label>
                                    {errors.appliedDate && <span role="alert"> {errors.appliedDate}</span>}
                                </p>
                            </>
                        )}

                        {target === 'Interview' && (
                            <p>
                                <label>
                                    Jadwal interview{' '}
                                    <input
                                        type="datetime-local" // pilih tanggal + jam
                                        value={extra.interviewAt}
                                        onChange={(event) => setField('interviewAt', event.target.value)}
                                    />
                                </label>
                                {errors.interviewAt && <span role="alert"> {errors.interviewAt}</span>}
                            </p>
                        )}

                        {target === 'Offer' && (
                            <>
                                <p>
                                    <label>
                                        Gaji offer{' '}
                                        <input
                                            type="number"
                                            min="0"
                                            value={extra.offerSalary}
                                            onChange={(event) => setField('offerSalary', event.target.value)}
                                        />
                                    </label>
                                    {errors.offerSalary && <span role="alert"> {errors.offerSalary}</span>}
                                </p>
                                <p>
                                    <label>
                                        Mode kerja{' '}
                                        <select
                                            value={extra.workMode}
                                            onChange={(event) => {
                                                // cocokin sama daftar WORK_MODES, kalau nggak ketemu berarti ''
                                                const picked: WorkMode | '' =
                                                    WORK_MODES.find((mode) => mode === event.target.value) ?? ''
                                                setField('workMode', picked)
                                            }}
                                        >
                                            <option value="">Pilih mode kerja</option>
                                            {WORK_MODES.map((mode) => (
                                                <option key={mode} value={mode}>{mode}</option>
                                            ))}
                                        </select>
                                    </label>
                                    {errors.workMode && <span role="alert"> {errors.workMode}</span>}
                                </p>
                            </>
                        )}

                        <button type="button" onClick={handleMove} disabled={!target}>
                            Ubah Status
                        </button>
                    </div>
                )}
            </div>

            <div className="detail-columns">
                {/* Slot poin 5: Checklist */}
                {/* {Dyfan} (poin 5) checklist milik lamaran ini. Tiap ada perubahan, daftar baru
                    dibungkus ke salinan lamaran lalu dikirim ke App lewat onChange */}
                <Checklist
                    items={application.checklist}
                    onChange={(items) => onChange({ ...application, checklist: items })}
                />
                {/* Slot poin 6: Riwayat Aktivitas + Interview Prep Timer Nadia */}
                {/* {Dyfan} (poin 6) riwayat aktivitas + catatan manual. Cara kerjanya sama kayak checklist:
                    daftar log baru dibungkus ke salinan lamaran lalu dikirim ke App lewat onChange */}
                <ActivityLogPanel
                    logs={application.logs}
                    onChange={(logs) => onChange({ ...application, logs })}
                />
            </div>

            <div className="detail-section timer-toggle-section">
                {/* {Dyfan} (poin 6) tempat timer Nadia. Tombol ini yang buka/tutup, logika timernya punya Nadia */}
                <button
                    type="button"
                    onClick={() => setShowTimer((open) => !open)} // balik true/false
                    aria-expanded={showTimer}
                >
                    {showTimer ? 'Tutup latihan interview' : 'Buka latihan interview'}
                </button>
                {showTimer && <InterviewPrepTimer />}
            </div>
        </section>
    )
}