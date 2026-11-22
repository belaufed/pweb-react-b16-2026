import { useState, type FormEvent } from 'react'

interface SkillProfileProps {
  skills: string[]
  onSkillsChange: (skills: string[]) => void
}

// Daftar skill diambil dari komponen induk supaya katalog ikut pakai data yang sama.
export function SkillProfile({ skills, onSkillsChange }: SkillProfileProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  // Pas form dikirim, cek dulu skill-nya kosong atau sudah ada.
  function handleAddSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newSkill = input.trim()

    if (!newSkill) {
      setError('Isi nama skill dulu.')
      return
    }

    // "React" dan "react" tetap dihitung sebagai skill yang sama.
    const alreadyExists = skills.some(
      (skill) => skill.trim().toLowerCase() === newSkill.toLowerCase(),
    )

    if (alreadyExists) {
      setError(`${newSkill} sudah ada di profil.`)
      return
    }

    onSkillsChange([...skills, newSkill])
    setInput('')
    setError('')
  }

  // Kirim balik daftar skill yang tersisa setelah satu skill dihapus.
  function handleRemoveSkill(selectedSkill: string) {
    onSkillsChange(skills.filter((skill) => skill !== selectedSkill))
    setError('')
  }

  // Hapus pesan lama begitu pengguna mulai memperbaiki input.
  function handleInputChange(value: string) {
    setInput(value)
    setError('')
  }

  return (
    <section>
      <h2>Profil Skill Kapten</h2>

      <form onSubmit={handleAddSkill}>
        <label htmlFor="skill-input">Nama skill</label>
        <input
          id="skill-input"
          value={input}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder="Contoh: Docker"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'skill-error' : undefined}
        />
        <button type="submit">Tambah skill</button>
      </form>

      {error && <p id="skill-error" role="alert">{error}</p>}

      {skills.length === 0 ? (
        <p>Belum ada skill di profil.</p>
      ) : (
        <ul>
          {skills.map((skill) => (
            <li key={skill}>
              {skill}{' '}
              <button
                type="button"
                aria-label={`Hapus skill ${skill}`}
                onClick={() => handleRemoveSkill(skill)}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}