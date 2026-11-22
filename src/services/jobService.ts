import type { JobListing } from '../types/JobListing'

export type JobSource = 'api' | 'local'

const API_URL = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=30'
const LOCAL_URL = '/magang-fallback.json'

// Aku cek isi tiap lowongan sebelum datanya dipakai di kartu.
function isJobListing(item: unknown): item is JobListing {
  if (typeof item !== 'object' || item === null) return false

  return (
    'id' in item && typeof item.id === 'number' &&
    'title' in item && typeof item.title === 'string' &&
    'company_name' in item && typeof item.company_name === 'string' &&
    'category' in item && typeof item.category === 'string' &&
    'candidate_required_location' in item &&
    typeof item.candidate_required_location === 'string' &&
    'salary' in item && typeof item.salary === 'string' &&
    'tags' in item && Array.isArray(item.tags) &&
    item.tags.every((tag: unknown) => typeof tag === 'string')
  )
}

// Ambil lowongan dari sumber yang lagi dipilih di katalog.
export async function fetchJobs(
  source: JobSource,
  signal: AbortSignal,
): Promise<JobListing[]> {
  const url = source === 'api' ? API_URL : LOCAL_URL

  // signal dipakai buat membatalkan request lama kalau sumbernya diganti.
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Gagal mengambil lowongan (HTTP ${response.status}).`)
  }

  const data: unknown = await response.json()

  // Remotive membungkus daftar di "jobs". Kalau file lokal langsung berupa array, pakai isinya.
  let jobs: unknown = data
  if (typeof data === 'object' && data !== null && 'jobs' in data) {
    jobs = data.jobs
  }

  if (!Array.isArray(jobs) || !jobs.every(isJobListing)) {
    throw new Error('Format data lowongan tidak sesuai.')
  }

  return jobs
}