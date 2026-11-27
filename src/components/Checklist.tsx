
// Checklist per lamaran (tambah, centang, hapus) + progress X/Y

import { useState } from 'react' // buat nyimpen isi input tugas baru
import type { FormEvent } from 'react' // tipe event pas form di-submit
import type { ChecklistItem } from '../types/Application' // cetakan satu butir tugas dari poin 1

// Daftar tugas yang ditampilin + fungsi buat ngabarin kalau daftarnya berubah
interface ChecklistProps {
    items: ChecklistItem[] // daftar tugas milik SATU lamaran
    onChange: (items: ChecklistItem[]) => void // dipanggil bawa daftar baru tiap ada perubahan
}

// Bikin id unik buat tugas baru
function makeId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID() // cara modern
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` // cadangan
}

export function Checklist({ items, onChange }: ChecklistProps) {
    const [text, setText] = useState('') // isi input tugas baru (controlled)

    const doneCount = items.filter((item) => item.done).length // hitung yang udah dicentang
    const total = items.length // total semua tugas

    // Dipanggil pas form tambah tugas di-submit
    function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault() // cegah halaman reload
        const clean = text.trim() // buang spasi di tepi
        if (!clean) return // kosong, abaikan aja

        // Bikin array BARU (salin yang lama + tugas baru), array lama nggak disentuh
        onChange([...items, { id: makeId(), text: clean, done: false }])
        setText('') // kosongin input
    }

    // Dipanggil pas checkbox diklik
    function handleToggle(id: string) {
        // map bikin array baru; cuma tugas yang id-nya cocok yang disalin lalu dibalik done-nya
        onChange(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
    }

    // Dipanggil pas tombol Hapus diklik
    function handleDelete(id: string) {
        // filter bikin array baru yang isinya semua tugas KECUALI yang id-nya cocok
        onChange(items.filter((item) => item.id !== id))
    }

    return (
        <section className="detail-subcard">
            <h3>Checklist</h3>

            {/* Progress: jumlah yang selesai / total */}
            <p className="subcard-meta">Progress: <strong>{doneCount}/{total}</strong></p>
            <progress
                className="checklist-progress"
                value={doneCount}
                max={Math.max(total, 1)}
                aria-label={`Progress checklist ${doneCount} dari ${total} selesai`}
            />

            {total === 0 && <p className="muted-text">Belum ada tugas.</p>}

            <ul className="checklist-list">
                {items.map((item) => (
                    <li key={item.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={item.done} // nilai centang dari data
                                onChange={() => handleToggle(item.id)} // klik = balik status
                            />{' '}
                            {/* tugas yang udah selesai dicoret biar kelihatan */}
                            <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
                                {item.text}
                            </span>
                        </label>{' '}
                        <button type="button" className="small-btn" onClick={() => handleDelete(item.id)}>
                            Hapus
                        </button>
                    </li>
                ))}
            </ul>

            <form className="inline-add-form" onSubmit={handleAdd}>
                <input
                    value={text}
                    onChange={(event) => setText(event.target.value)} // update state tiap ngetik
                    placeholder="Contoh: Siapkan portofolio"
                    aria-label="Tugas baru"
                />{' '}
                <button type="submit">Tambah Tugas</button>
            </form>
        </section>
    )
}