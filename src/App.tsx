import { useState } from 'react'
import { InterviewPrepTimer } from './components/InterviewPrepTimer'
import { JobCatalog } from './components/JobCatalog'
import { SkillProfile } from './components/SkillProfile'
import type { JobListing } from './types/JobListing'

// Profil dan katalog pakai daftar skill yang sama biar skor langsung ikut berubah.
export default function App() {
  const [skills, setSkills] = useState(['React', 'TypeScript', 'CSS'])
  const [wishlist, setWishlist] = useState<JobListing[]>([])
  const [showTimer, setShowTimer] = useState(false)

  // Pas panel ditutup, React melepas komponen timer dan menjalankan cleanup-nya.
  function toggleTimerPanel() {
    setShowTimer((open) => !open)
  }

  // Simpan pilihan dari katalog. Nanti ini disambung ke fungsi tambah lamaran Dyfan.
  function saveToWishlist(job: JobListing) {
    setWishlist((current) => {
      // Satu perusahaan bisa punya beberapa posisi, jadi cek keduanya.
      const exists = current.some(
        (item) =>
          item.company_name.trim().toLowerCase() === job.company_name.trim().toLowerCase() &&
          item.title.trim().toLowerCase() === job.title.trim().toLowerCase(),
      )

      if (exists) return current
      return [...current, job]
    })
  }

  // Dua field ini dipakai katalog buat menentukan tombol "Sudah Dilamar".
  const applications = wishlist.map((job) => ({
    company: job.company_name,
    role: job.title,
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

      <JobCatalog
        skills={skills}
        applications={applications}
        onSave={saveToWishlist}
      />
    </main>
  )
}