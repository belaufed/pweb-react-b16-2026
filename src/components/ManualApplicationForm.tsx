//form buat nambah lamaran manual (Wishlist atau Applied)

import { useRef, useState } from 'react' // useState buat nyimpen isi input, useRef buat nunjuk elemen input
import type { FormEvent } from 'react' // tipe event pas form di-submit
import type { Application } from '../types/Application' // cetakan lamaran dari poin 1
import { createApplication } from '../utils/createApplication' // fungsi bikin lamaran dari poin 2

//Data apa aja yang dikasih App.tsx ke form ini
interface ManualApplicationFormProps {
    applications: Application[] // daftar lamaran yang udah ada, dipakai buat cek duplikat
    onAdd: (application: Application) => void // fungsi dari App buat nambahin lamaran baru
}

// Nama-nama field yang bisa error
type FieldName = 'company' | 'role' | 'cvVersion' | 'appliedDate'

// Tempat nyimpen pesan error per field, boleh kosong semua
type Errors = Partial<Record<FieldName, string>>

export function ManualApplicationForm({ applications, onAdd }: ManualApplicationFormProps) {
    // State input (semuanya controlled, jadi nilainya dipegang React) ===
    const [company, setCompany] = useState('') // isi input perusahaan
    const [role, setRole] = useState('') // isi input posisi
    const [status, setStatus] = useState<'Wishlist' | 'Applied'>('Wishlist') // status awal, default Wishlist
    const [cvVersion, setCvVersion] = useState('') // isi input versi CV (cuma muncul kalau Applied)
    const [appliedDate, setAppliedDate] = useState('') // isi input tanggal melamar (cuma muncul kalau Applied)
    const [errors, setErrors] = useState<Errors>({}) // pesan error per field

    // Ref buat fokus otomatis ke input yang bermasalah ===
    const companyRef = useRef<HTMLInputElement>(null) // nunjuk ke input perusahaan
    const roleRef = useRef<HTMLInputElement>(null) // nunjuk ke input posisi
    const cvRef = useRef<HTMLInputElement>(null) // nunjuk ke input versi CV
    const dateRef = useRef<HTMLInputElement>(null) // nunjuk ke input tanggal melamar

    // Urutan field dari atas ke bawah, dipakai buat nyari "input pertama yang bermasalah"
    const fieldOrder: { name: FieldName; ref: typeof companyRef }[] = [
        { name: 'company', ref: companyRef },
        { name: 'role', ref: roleRef },
        { name: 'cvVersion', ref: cvRef },
        { name: 'appliedDate', ref: dateRef },
    ]

    // Dipanggil pas tombol Tambah diklik
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault() // cegah halaman reload bawaan form

        // Langkah 1: cek isian satu-satu ---
        const newErrors: Errors = {} // wadah error baru
        if (!company.trim()) newErrors.company = 'Perusahaan wajib diisi.' // perusahaan kosong
        if (!role.trim()) newErrors.role = 'Posisi wajib diisi.' // posisi kosong
        if (status === 'Applied') {
            // dua field ini cuma wajib kalau status awalnya Applied
            if (!cvVersion.trim()) newErrors.cvVersion = 'Versi CV wajib diisi.'
            if (!appliedDate) newErrors.appliedDate = 'Tanggal melamar wajib diisi.'
        }

        // Langkah 2: kalau ada error, fokus ke input paling atas yang error 
        const firstBad = fieldOrder.find((field) => newErrors[field.name]) // cari yang pertama error
        if (firstBad) {
            setErrors(newErrors) // tampilin semua pesan error
            firstBad.ref.current?.focus() // kursor langsung loncat ke input itu
            return // stop, jangan lanjut bikin lamaran
        }

        // Langkah 3: isian udah oke, minta fungsi poin 2 bikin lamarannya 
        const result = createApplication(applications, {
            company, // nama perusahaan
            role, // posisi
            status, // Wishlist atau Applied
            cvVersion: status === 'Applied' ? cvVersion : null, // CV cuma dikirim kalau Applied
            appliedDate: status === 'Applied' ? appliedDate : null, // tanggal cuma dikirim kalau Applied
        })

        // Gagal di sini biasanya karena duplikat (perusahaan + posisi udah ada)
        if (!result.ok) {
            setErrors({ company: result.error }) // tampilin pesan duplikatnya
            companyRef.current?.focus() // fokus balik ke input perusahaan
            return
        }

        // Langkah 4: sukses, kirim ke App lalu kosongin form 
        onAdd(result.application) // kasih lamaran baru ke App
        setCompany('') // kosongin perusahaan
        setRole('') // kosongin posisi
        setStatus('Wishlist') // balik ke status awal default
        setCvVersion('') // kosongin versi CV
        setAppliedDate('') // kosongin tanggal
        setErrors({}) // hapus semua pesan error
    }

    return (
        <section className="application-panel">
            <h2>Tambah Lamaran Manual</h2>

            {/* noValidate biar yang ngecek itu kode kita, bukan popup bawaan browser */}
            <form onSubmit={handleSubmit} noValidate>
                <p>
                    <label>
                        Perusahaan{' '}
                        <input
                            ref={companyRef} // sambungin ref biar bisa difokusin
                            value={company} // nilai dari state
                            onChange={(event) => setCompany(event.target.value)} // update state tiap ngetik
                            placeholder="Contoh: Tokopedia"
                        />
                    </label>
                    {errors.company && <span role="alert"> {errors.company}</span>}
                </p>

                <p>
                    <label>
                        Posisi{' '}
                        <input
                            ref={roleRef}
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            placeholder="Contoh: Frontend Intern"
                        />
                    </label>
                    {errors.role && <span role="alert"> {errors.role}</span>}
                </p>

                <p>
                    <label>
                        Status awal{' '}
                        <select
                            value={status}
                            // kalau bukan 'Applied' otomatis dianggap Wishlist
                            onChange={(event) => setStatus(event.target.value === 'Applied' ? 'Applied' : 'Wishlist')}
                        >
                            <option value="Wishlist">Wishlist</option>
                            <option value="Applied">Applied</option>
                        </select>
                    </label>
                </p>

                {/* Dua input ini cuma muncul kalau status awalnya Applied */}
                {status === 'Applied' && (
                    <>
                        <p>
                            <label>
                                Versi CV{' '}
                                <input
                                    ref={cvRef}
                                    value={cvVersion}
                                    onChange={(event) => setCvVersion(event.target.value)}
                                    placeholder="Contoh: CV v2"
                                />
                            </label>
                            {errors.cvVersion && <span role="alert"> {errors.cvVersion}</span>}
                        </p>

                        <p>
                            <label>
                                Tanggal melamar{' '}
                                <input
                                    ref={dateRef}
                                    type="date" // pilih tanggal lewat kalender
                                    value={appliedDate}
                                    onChange={(event) => setAppliedDate(event.target.value)}
                                />
                            </label>
                            {errors.appliedDate && <span role="alert"> {errors.appliedDate}</span>}
                        </p>
                    </>
                )}

                <button type="submit">Tambah Lamaran</button>
            </form>
        </section>
    )
}