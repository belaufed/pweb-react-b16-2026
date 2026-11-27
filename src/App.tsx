import { useState } from 'react'
import { JobCatalog } from './components/JobCatalog'
import { SkillProfile } from './components/SkillProfile'
import type { JobListing } from './types/JobListing'
import { ManualApplicationForm } from './components/ManualApplicationForm' // tambahan Dyfan: form manual
import type { Application } from './types/Application' // tambahan Dyfan: cetakan lamaran
import { createApplication } from './utils/createApplication' // tambahan Dyfan: fungsi bikin lamaran
import { ApplicationDetail } from './components/ApplicationDetail' // {Dyfan} (poin 4) halaman detail lamaran
import './styles/application.css' // {Dyfan} (poin 7) gaya form manual + halaman detail
import { useLocalStorage } from './hooks/useLocalStorage'
import { WarRoom } from './components/WarRoom'
import { Dashboard } from './components/Dashboard'

// Profil dan katalog pakai daftar skill yang sama biar skor langsung ikut berubah.
export default function App() {
  const [skills, setSkills] = useLocalStorage<string[]>('arul.kaptenSkills', ['React', 'TypeScript', 'CSS'])
  // {Dyfan} gantiin wishlist, sekarang nyimpen lamaran lengkap (dari katalog dan form manual)
  const [allApplications, setAllApplications] = useLocalStorage<Application[]>('arul.applications', [])
  const [activePage, setActivePage] = useState<'explore' | 'pipeline' | 'dashboard'>('explore')
  // {Dyfan} (poin 4) id lamaran yang lagi dibuka di halaman detail, null = belum ada yang dibuka
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Pas panel ditutup, React melepas komponen timer dan menjalankan cleanup-nya.
  // Simpan pilihan dari katalog. Nanti ini disambung ke fungsi tambah lamaran Dyfan.
  function saveToWishlist(job: JobListing) {
    // {Dyfan} cek duplikat sekarang diurus createApplication, jadi di sini tinggal manggil
    setAllApplications((current) => {
      const result = createApplication(current, {
        company: job.company_name, // nama perusahaan dari data API
        role: job.title, // posisi dari data API
        status: 'Wishlist', // dari katalog selalu masuk Wishlist dulu
        requiredSkills: job.tags,
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
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-kicker">Internship Tracker</span>
          <h1>Aku Mw Magang</h1>
        </div>
        <nav className="app-nav" aria-label="Navigasi utama">
          <button
            type="button"
            className={activePage === 'explore' ? 'is-active' : undefined}
            aria-current={activePage === 'explore' ? 'page' : undefined}
            onClick={() => setActivePage('explore')}
          >
            Eksplorasi
          </button>
          <button
            type="button"
            className={activePage === 'pipeline' ? 'is-active' : undefined}
            aria-current={activePage === 'pipeline' ? 'page' : undefined}
            onClick={() => setActivePage('pipeline')}
          >
            War Room
          </button>
          <button
            type="button"
            className={activePage === 'dashboard' ? 'is-active' : undefined}
            aria-current={activePage === 'dashboard' ? 'page' : undefined}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      {activePage === 'explore' && (
        <div className="explore-layout">
          <div className="explore-top-grid">
            <SkillProfile skills={skills} onSkillsChange={setSkills} />
            <ManualApplicationForm applications={allApplications} onAdd={addManualApplication} />
          </div>
          <JobCatalog skills={skills} applications={applications} onSave={saveToWishlist} />
        </div>
      )}

      {activePage === 'pipeline' && (
        <div className="pipeline-layout">
          <WarRoom
            applications={allApplications}
            skills={skills}
            onChange={setAllApplications}
            onSelect={setSelectedId}
          />
          {/* {Dyfan} (poin 4) detail tampil kalau ada lamaran yang dipilih.
              key = id biar isian form kereset otomatis tiap ganti lamaran */}
          {selectedApplication && (
            <ApplicationDetail
              key={selectedApplication.id}
              application={selectedApplication}
              onChange={updateApplication}
            />
          )}
        </div>
      )}

      {activePage === 'dashboard' && (
        <Dashboard applications={allApplications} skills={skills} />
      )}

      {/* Tetap tampilkan detail jika dipilih dan pengguna pindah tab selain pipeline */}
      {activePage !== 'pipeline' && selectedApplication && (
        <ApplicationDetail
          key={selectedApplication.id}
          application={selectedApplication}
          onChange={updateApplication}
        />
      )}
    </main>
  )
}