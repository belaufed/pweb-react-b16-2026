// Aku pakai fungsi ini buat cek skill mana yang udah cocok dan berapa persen match-nya.
export function calculateSkillMatch(
  kaptenSkills: string[],
  requiredSkills: string[],
) {
  // Biar "React" di profil tetap cocok sama "react" di lowongan.
  const profileSkills = new Set(
    kaptenSkills.map((skill) => skill.trim().toLowerCase()),
  )

  const matchedSkills: string[] = []
  const missingSkills: string[] = []
  const checkedSkills = new Set<string>()

  for (const skill of requiredSkills) {
    const label = skill.trim()
    const key = label.toLowerCase()

    // Lewati yang kosong atau dobel biar hitungan skornya tetap pas.
    if (!key || checkedSkills.has(key)) continue
    checkedSkills.add(key)

    // Buat ditampilin di kartu, aku simpan nama skill sesuai tulisan lowongannya.
    if (profileSkills.has(key)) {
      matchedSkills.push(label)
    } else {
      missingSkills.push(label)
    }
  }

  // Kalau lowongannya belum mencantumkan skill, skornya aku set 0 biar nggak dibagi nol.
  const totalRequired = checkedSkills.size
  const score = totalRequired === 0
    ? 0
    : Math.round((matchedSkills.length / totalRequired) * 100)

  return { score, matchedSkills, missingSkills }
}