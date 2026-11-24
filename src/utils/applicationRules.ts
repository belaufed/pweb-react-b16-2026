import type { Application } from '../types/Application'

export function isGhostingApplication(application: Application, now = Date.now()) {
  if (application.status !== 'Applied' && application.status !== 'Screening') return false
  const changedAt = Date.parse(application.lastUpdatedAt)
  return Number.isFinite(changedAt) && now - changedAt > 14 * 24 * 60 * 60 * 1000
}

export function findInterviewConflicts(applications: Application[]) {
  const interviews = applications.filter(
    (application) => application.status === 'Interview' && application.interviewAt,
  )
  const conflicts: [Application, Application][] = []

  for (let i = 0; i < interviews.length; i += 1) {
    for (let j = i + 1; j < interviews.length; j += 1) {
      const first = Date.parse(interviews[i].interviewAt ?? '')
      const second = Date.parse(interviews[j].interviewAt ?? '')
      if (!Number.isFinite(first) || !Number.isFinite(second)) continue
      if (Math.abs(first - second) < 60 * 60 * 1000) {
        conflicts.push([interviews[i], interviews[j]])
      }
    }
  }

  return conflicts
}
