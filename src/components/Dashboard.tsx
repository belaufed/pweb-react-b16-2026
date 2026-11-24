import { useState } from 'react'
import type { Application, WorkMode } from '../types/Application'
import { calculateSkillMatch } from '../utils/skillMatch'
import { isGhostingApplication } from '../utils/applicationRules'

interface DashboardProps {
  applications: Application[]
  skills: string[]
}

function workModeScore(mode: WorkMode | null) {
  if (mode === 'Remote') return 100
  if (mode === 'Hybrid') return 75
  if (mode === 'Onsite') return 50
  return 0
}

export function Dashboard({ applications, skills }: DashboardProps) {
  const offers = applications.filter((application) => application.status === 'Offer')
  const [offerAId, setOfferAId] = useState('')
  const [offerBId, setOfferBId] = useState('')

  const total = applications.length
  const responseCount = applications.filter((application) =>
    ['Screening', 'Interview', 'Offer', 'Rejected', 'Ghosted'].includes(application.status),
  ).length
  const interviewCount = applications.filter((application) =>
    ['Interview', 'Offer'].includes(application.status),
  ).length
  const ghostingCount = applications.filter((application) => isGhostingApplication(application)).length

  const responseRate = total === 0 ? 0 : Math.round((responseCount / total) * 100)
  const interviewRate = total === 0 ? 0 : Math.round((interviewCount / total) * 100)

  const offerA = offers.find((offer) => offer.id === offerAId) ?? null
  const offerB = offers.find((offer) => offer.id === offerBId) ?? null
  const maxSalary = Math.max(
    1,
    ...offers.map((offer) => offer.offerSalary ?? 0),
  )

  function offerScore(offer: Application) {
    const salaryScore = ((offer.offerSalary ?? 0) / maxSalary) * 100
    const matchScore = calculateSkillMatch(skills, offer.requiredSkills ?? []).score
    return {
      salaryScore,
      matchScore,
      workModeScore: workModeScore(offer.workMode),
      totalScore: salaryScore * 0.5 + workModeScore(offer.workMode) * 0.25 + matchScore * 0.25,
    }
  }

  const scoreA = offerA ? offerScore(offerA) : null
  const scoreB = offerB ? offerScore(offerB) : null

  return (
    <section className="dashboard application-panel">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <article><strong>{total}</strong><span>Total Lamaran</span></article>
        <article><strong>{responseRate}%</strong><span>Response Rate</span></article>
        <article><strong>{interviewRate}%</strong><span>Interview Rate</span></article>
        <article><strong>{ghostingCount}</strong><span>Rawan Ghosting</span></article>
        <article><strong>{offers.length}</strong><span>Total Offer</span></article>
      </div>

      <h3>Offer Comparator</h3>
      {offers.length < 2 ? (
        <p>Belum cukup offer untuk dibandingkan. Minimal dua lamaran berstatus Offer.</p>
      ) : (
        <>
          <div className="comparator-selectors">
            <label>
              Offer A
              <select value={offerAId} onChange={(event) => setOfferAId(event.target.value)}>
                <option value="">Pilih offer</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>{offer.company} - {offer.role}</option>
                ))}
              </select>
            </label>
            <label>
              Offer B
              <select value={offerBId} onChange={(event) => setOfferBId(event.target.value)}>
                <option value="">Pilih offer</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>{offer.company} - {offer.role}</option>
                ))}
              </select>
            </label>
          </div>

          {offerA && offerB && offerA.id !== offerB.id && scoreA && scoreB ? (
            <div className="offer-comparison">
              {[{ offer: offerA, score: scoreA }, { offer: offerB, score: scoreB }]
                .sort((a, b) => b.score.totalScore - a.score.totalScore)
                .map(({ offer, score }, index) => (
                  <article key={offer.id} className="offer-card">
                    {index === 0 && <span className="recommendation">Rekomendasi Terbaik</span>}
                    <h4>{offer.company} - {offer.role}</h4>
                    <p>Gaji: Rp {(offer.offerSalary ?? 0).toLocaleString('id-ID')}</p>
                    <p>Mode kerja: {offer.workMode ?? '-'}</p>
                    <p>Skill Match: {score.matchScore}%</p>
                    <p>Skor mode: {score.workModeScore}</p>
                    <p>Skor gaji ternormalisasi: {score.salaryScore.toFixed(1)}</p>
                    <p><strong>Total skor: {score.totalScore.toFixed(1)}</strong></p>
                  </article>
                ))}
            </div>
          ) : (
            <p>Pilih dua offer berbeda untuk melihat perbandingan.</p>
          )}
        </>
      )}
    </section>
  )
}
