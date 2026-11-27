import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { fetchJobs, type JobSource } from '../services/jobService'
import type { JobListing } from '../types/JobListing'
import { calculateSkillMatch } from '../utils/skillMatch'
import { JobCard } from './JobCard'

interface JobCatalogProps {
  skills: string[]
  applications: { company: string; role: string }[]
  onSave: (job: JobListing) => void
}

// Samakan tulisannya supaya "Nusantara Cloud" dan "nusantara cloud" tetap cocok.
function normalize(text: string) {
  return text.trim().toLowerCase()
}

// Katalog ambil lowongan, lalu urutkan hasilnya sesuai skill Kapten.
export function JobCatalog({ skills, applications, onSave }: JobCatalogProps) {
  const [source, setSource] = useState<JobSource>('api')
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const search = normalize(useDebounce(keyword, 400))

  // Ambil data lagi kalau sumber berubah atau tombol Coba Lagi diklik.
  useEffect(() => {
    const controller = new AbortController()

    // Pakai controller milik request ini supaya hasil lama nggak menimpa hasil baru.
    async function loadJobs() {
      setLoading(true)
      setError('')
      setJobs([])

      try {
        const result = await fetchJobs(source, controller.signal)
        if (!controller.signal.aborted) setJobs(result)
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Gagal mengambil lowongan.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadJobs()

    // Batalkan request kalau pindah sumber atau keluar dari halaman katalog.
    return () => controller.abort()
  }, [source, attempt])

  // Reset kategori karena pilihan kategori di API dan data lokal bisa beda.
  function changeSource(nextSource: JobSource) {
    setCategory('')
    setSource(nextSource)
  }

  // Cek semua lamaran, termasuk yang nanti ditambahkan lewat form manual.
  function alreadyApplied(job: JobListing) {
    return applications.some(
      (item) =>
        normalize(item.company) === normalize(job.company_name) &&
        normalize(item.role) === normalize(job.title),
    )
  }

  const categories = [...new Set(jobs.map((job) => job.category))].sort()

  // Filter dulu, hitung match dari skill terbaru, lalu taruh skor tertinggi di atas.
  const visibleJobs = jobs
    .filter((job) => {
      const searchableText = [job.title, job.company_name, ...job.tags].join(' ')
      return (!category || job.category === category) &&
        normalize(searchableText).includes(search)
    })
    .map((job) => ({ job, match: calculateSkillMatch(skills, job.tags) }))
    .sort((a, b) => b.match.score - a.match.score)

  return (
    <section className="application-panel job-catalog">
      <h2>Eksplorasi Lowongan</h2>

      <div className="catalog-controls">
        <label>
          Sumber data{' '}
          <select
            value={source}
            onChange={(event) => changeSource(event.target.value === 'api' ? 'api' : 'local')}
          >
            <option value="local">Fallback Lokal</option>
            <option value="api">Live API</option>
          </select>
        </label>

        <label className="catalog-search">
          Cari lowongan{' '}
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Posisi, perusahaan, atau skill"
          />
        </label>

        <label>
          Kategori{' '}
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Semua kategori</option>
            {categories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>

      {loading && <p className="status-banner" role="status">Memuat lowongan...</p>}

      {error && (
        <div className="error-box">
          <p role="alert">{error}</p>
          <div className="button-group">
            <button type="button" onClick={() => setAttempt(attempt + 1)}>
              Coba Lagi
            </button>
            {source === 'api' && (
              <button type="button" onClick={() => changeSource('local')}>
                Pakai Fallback Lokal
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="catalog-summary" role="status">
            {visibleJobs.length > 0
              ? `${visibleJobs.length} lowongan ditemukan`
              : 'Tidak ada lowongan yang cocok.'}
          </p>
          <div className="job-grid">
            {visibleJobs.map(({ job, match }) => (
              <JobCard
                key={job.id}
                job={job}
                match={match}
                alreadyApplied={alreadyApplied(job)}
                onSave={onSave}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}