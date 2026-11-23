import { useState } from 'react'
import { InterviewPrepTimer } from './components/InterviewPrepTimer'
import { JobCatalog } from './components/JobCatalog'
import { SkillProfile } from './components/SkillProfile'
import type { JobListing } from './types/JobListing'
import { ManualApplicationForm } from './components/ManualApplicationForm' // tambahan Dyfan: form manual
import type { Application } from './types/Application' // tambahan Dyfan: cetakan lamaran
import { createApplication } from './utils/createApplication' // tambahan Dyfan: fungsi bikin lamaran
import { ApplicationDetail } from './components/ApplicationDetail' // {Dyfan} (poin 4) halaman detail lamaran
import './styles/application.css' // {Dyfan} (poin 7) gaya form manual + halaman detail

// Profil dan katalog pakai daftar skill yang sama biar skor langsung ikut berubah.
export default function App() {
  const [skills, setSkills] = useState(['React', 'TypeScript', 'CSS'])
  // {Dyfan} gantiin wishlist, sekarang nyimpen lamaran lengkap (dari katalog dan form manual)
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [showTimer, setShowTimer] = useState(false)
  // {Dyfan} (poin 4) id lamaran yang lagi dibuka di halaman detail, null = belum ada yang dibuka
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Pas panel ditutup, React melepas komponen timer dan menjalankan cleanup-nya.
  function toggleTimerPanel() {
    setShowTimer((open) => !open)
  }

  // Simpan pilihan dari katalog. Nanti ini disambung ke fungsi tambah lamaran Dyfan.
  function saveToWishlist(job: JobListing) {
    // {Dyfan} cek duplikat sekarang diurus createApplication, jadi di sini tinggal manggil
    setAllApplications((current) => {
      const result = createApplication(current, {
        company: job.company_name, // nama perusahaan dari data API
        role: job.title, // posisi dari data API
        status: 'Wishlist', // dari katalog selalu masuk Wishlist dulu
      })

      if (!result.ok) return current // duplikat atau gagal, daftar nggak berubah
      return [...current, result.application] // sukses, tambahin di paling belakang
    })
  }

  // {Dyfan} dipanggil form manual kalau lamaran berhasil dibuat
  function addManualApplication(application: Application) {
    setAllApplications((current) => [...current, application]) // tambahin ke daftar
  }

  // {Dyfan} (poin 4) dipanggil halaman detail pas lamaran berubah (misal status pindah)
  function updateApplication(updated: Application) {
    setAllApplications((current) =>
      current.map((app) => (app.id === updated.id ? updated : app)), // ganti yang id-nya sama, sisanya tetap
    )
  }

  // {Dyfan} (poin 4) cari lamaran yang lagi dibuka, kalau nggak ketemu hasilnya null
  const selectedApplication = allApplications.find((app) => app.id === selectedId) ?? null

  // Dua field ini dipakai katalog buat menentukan tombol "Sudah Dilamar".
  const applications = allApplications.map((app) => ({
    company: app.company,
    role: app.role,
  }))

  return (
    <main>
      <h1>Aku Mw Magang</h1>

      <button
        type="button"
        onClick={toggleTimerPanel}
        aria-expanded={showTimer}
      >
        {showTimer ? 'Tutup latihan interview' : 'Buka latihan interview'}
      </button>

      {showTimer && <InterviewPrepTimer />}

      <SkillProfile skills={skills} onSkillsChange={setSkills} />

      {/* {Dyfan} form tambah lamaran manual */}
      <ManualApplicationForm
        applications={allApplications}
        onAdd={addManualApplication}
      />

      {/* {Dyfan} daftar SEMENTARA buat ngecek hasil, nanti dihapus pas halaman detail (poin 4) jadi */}
      <section>
        <h2>Daftar Lamaran (sementara)</h2>
        {allApplications.length === 0 && <p>Belum ada lamaran.</p>}
        <ul>
          {allApplications.map((app) => (
            <li key={app.id}>
              {app.company} - {app.role} ({app.status}){' '}
              {/* {Dyfan} (poin 4) klik buat buka halaman detail lamaran ini */}
              <button type="button" onClick={() => setSelectedId(app.id)}>
                Lihat Detail
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* {Dyfan} (poin 4) detail tampil kalau ada lamaran yang dipilih.
          key = id biar isian form kereset otomatis tiap ganti lamaran */}
      {selectedApplication && (
        <ApplicationDetail
          key={selectedApplication.id}
          application={selectedApplication}
          onChange={updateApplication}
        />
      )}

      <JobCatalog
        skills={skills}
        applications={applications}
        onSave={saveToWishlist}
      />
    </main>
  )
}