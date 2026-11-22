import type { JobListing } from '../types/JobListing'
import type { calculateSkillMatch } from '../utils/skillMatch'

interface JobCardProps {
  job: JobListing
  // Katalog bisa pakai hasil match yang sama buat mengurutkan dan menampilkan skor.
  match: ReturnType<typeof calculateSkillMatch>
  alreadyApplied: boolean
  onSave: (job: JobListing) => void
}

// Warna badge mengikuti batas skor yang ada di soal.
function getBadgeColor(score: number) {
  if (score >= 70) return '#b7efc5'
  if (score >= 40) return '#ffe69c'
  return '#ffc9c9'
}

// Satu kartu menampilkan satu lowongan beserta hasil cek skill Kapten.
export function JobCard({ job, match, alreadyApplied, onSave }: JobCardProps) {
  // Kirim lowongan yang diklik ke katalog buat disimpan ke Wishlist.
  function handleSave() {
    onSave(job)
  }

  return (
    <article>
      <h3>{job.title}</h3>
      <p>{job.company_name} · {job.category}</p>
      <p>{job.candidate_required_location}</p>
      <p>Gaji: {job.salary || 'Belum dicantumkan'}</p>

      <strong
        style={{
          backgroundColor: getBadgeColor(match.score),
          color: '#222',
          padding: '3px 8px',
          borderRadius: '6px',
        }}
      >
        Match {match.score}%
      </strong>

      <p>Skill cocok: {match.matchedSkills.join(', ') || 'Belum ada'}</p>
      <p>Skill yang kurang: {match.missingSkills.join(', ') || 'Tidak ada'}</p>

      <button type="button" onClick={handleSave} disabled={alreadyApplied}>
        {alreadyApplied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
      </button>
    </article>
  )
}