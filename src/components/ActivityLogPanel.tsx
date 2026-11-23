// Nampilin riwayat aktivitas satu lamaran + input catatan manual

import { useState } from 'react' // buat nyimpen isi input catatan
import type { SyntheticEvent } from 'react' // tipe event pas form di-submit
import type { ActivityLog as LogEntry } from '../types/Application' // cetakan satu baris log dari poin 1 (di-rename biar nggak bentrok sama nama komponen)

// Props: daftar log yang ditampilin + fungsi buat ngabarin kalau daftarnya berubah
interface ActivityLogPanelProps {
    logs: LogEntry[] // riwayat milik SATU lamaran
    onChange: (logs: LogEntry[]) => void // dipanggil bawa daftar log baru
}

// Bikin id unik buat log baru
function makeId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID() // cara modern
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` // cadangan
}

export function ActivityLogPanel({ logs, onChange }: ActivityLogPanelProps) {
    const [note, setNote] = useState('') // isi input catatan (controlled)

    // Dipanggil pas form catatan di-submit
    function handleAddNote(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault() // cegah halaman reload
        const clean = note.trim() // buang spasi di tepi
        if (!clean) return // kosong, abaikan aja

        // IMMUTABLE: bikin array BARU (salin log lama + catatan baru), array lama nggak disentuh
        onChange([
            ...logs,
            {
                id: makeId(), // id unik log baru
                timestamp: new Date().toISOString(), // waktu catatan dibuat
                message: `Catatan: ${clean}`, // kasih awalan biar beda sama log otomatis
            },
        ])
        setNote('') // kosongin input
    }

    // Balik urutan biar yang terbaru di atas. Pakai salinan ([...logs]) karena reverse() ngubah array aslinya
    const newestFirst = [...logs].reverse()

    return (
        <section>
            <h3>Riwayat Aktivitas</h3>

            {logs.length === 0 && <p>Belum ada aktivitas.</p>}

            <ul>
                {newestFirst.map((log) => (
                    <li key={log.id}>
                        {/* waktu dari ISO diubah jadi format lokal Indonesia */}
                        [{new Date(log.timestamp).toLocaleString('id-ID')}] {log.message}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddNote}>
                <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)} // update state tiap ngetik
                    placeholder="Contoh: HR minta kirim portofolio"
                    aria-label="Catatan baru"
                />{' '}
                <button type="submit">Tambah Catatan</button>
            </form>
        </section>
    )
}