import { useEffect, useMemo, useRef, useState } from 'react'
import type { Application, ApplicationStatus } from '../types/Application'
import { APPLICATION_STATUSES } from '../types/Application'
import { calculateSkillMatch } from '../utils/skillMatch'
import { findInterviewConflicts, isGhostingApplication } from '../utils/applicationRules'

interface WarRoomProps {
  applications: Application[]
  skills: string[]
  onChange: (applications: Application[]) => void
  onSelect: (id: string) => void
}

type UndoItem = { application: Application; index: number }
type SortMode = 'latest' | 'interview' | 'offer'

export function WarRoom({ applications, skills, onChange, onSelect }: WarRoomProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [onlyGhosting, setOnlyGhosting] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null)
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
  }, [])

  const conflicts = useMemo(() => findInterviewConflicts(applications), [applications])

  const visibleApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = applications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        `${application.company} ${application.role}`.toLowerCase().includes(normalizedSearch)
      const matchesStatus = !status || application.status === status
      const matchesGhosting = !onlyGhosting || isGhostingApplication(application)
      return matchesSearch && matchesStatus && matchesGhosting
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'interview') {
        const aTime = a.interviewAt ? Date.parse(a.interviewAt) : Number.POSITIVE_INFINITY
        const bTime = b.interviewAt ? Date.parse(b.interviewAt) : Number.POSITIVE_INFINITY
        return aTime - bTime
      }
      if (sortMode === 'offer') {
        return (b.offerSalary ?? 0) - (a.offerSalary ?? 0)
      }
      return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt)
    })
  }, [applications, search, status, onlyGhosting, sortMode])

  function deleteApplication(application: Application) {
    const index = applications.findIndex((item) => item.id === application.id)
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    onChange(applications.filter((item) => item.id !== application.id))
    setUndoItem({ application, index })
    undoTimeoutRef.current = setTimeout(() => {
      setUndoItem(null)
      undoTimeoutRef.current = null
    }, 5000)
  }

  function undoDelete() {
    if (!undoItem) return
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }
    onChange((() => {
      const restored = [...applications]
      restored.splice(Math.max(0, undoItem.index), 0, undoItem.application)
      return restored
    })())
    setUndoItem(null)
  }

  function simulateGhosting(application: Application) {
    const older = new Date(Date.parse(application.lastUpdatedAt) - 15 * 24 * 60 * 60 * 1000).toISOString()
    onChange(applications.map((item) =>
      item.id === application.id ? { ...item, lastUpdatedAt: older } : item,
    ))
  }

  return (
    <section className="war-room application-panel">
      <h2>War Room Lamaran</h2>

      {conflicts.length > 0 && (
        <div className="conflict-banner" role="alert">
          Bentrok jadwal interview:
          {conflicts.map(([first, second]) => (
            <span key={`${first.id}-${second.id}`}>
              {' '}{first.company} dan {second.company} berselisih kurang dari 60 menit.
            </span>
          ))}
        </div>
      )}

      <div className="war-room-controls">
        <label>
          Cari
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Perusahaan atau posisi"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus | '')}
          >
            <option value="">Semua status</option>
            {APPLICATION_STATUSES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={onlyGhosting}
            onChange={(event) => setOnlyGhosting(event.target.checked)}
          />
          Hanya Rawan Ghosting
        </label>
        <label>
          Urutkan
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="latest">Terbaru</option>
            <option value="interview">Interview terdekat</option>
            <option value="offer">Offer tertinggi</option>
          </select>
        </label>
      </div>

      {visibleApplications.length === 0 ? (
        <p>Tidak ada lamaran yang cocok dengan filter.</p>
      ) : (
        <div className="application-grid">
          {visibleApplications.map((application) => {
            const match = calculateSkillMatch(skills, application.requiredSkills ?? [])
            const checklistDone = application.checklist.filter((item) => item.done).length
            const ghosting = isGhostingApplication(application)
            return (
              <article className="application-card" key={application.id}>
                <h3>{application.company}</h3>
                <p>{application.role}</p>
                <p>Status: <strong>{application.status}</strong></p>
                {ghosting && <span className="ghosting-badge">Rawan Ghosting</span>}
                <p>CV: {application.cvVersion ?? '-'}</p>
                <p>Checklist: {checklistDone}/{application.checklist.length}</p>
                <p>Skill Match: {match.score}%</p>
                {(application.status === 'Applied' || application.status === 'Screening') && (
                  <button type="button" onClick={() => simulateGhosting(application)}>
                    Simulasi +15 Hari
                  </button>
                )}
                <button type="button" onClick={() => onSelect(application.id)}>Lihat Detail</button>
                <button type="button" onClick={() => deleteApplication(application)}>Hapus</button>
              </article>
            )
          })}
        </div>
      )}

      {undoItem && (
        <div className="undo-toast" role="status">
          Lamaran {undoItem.application.company} dihapus.
          <button type="button" onClick={undoDelete}>Undo</button>
        </div>
      )}
    </section>
  )
}
