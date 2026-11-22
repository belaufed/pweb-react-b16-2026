import { useEffect, useState } from 'react'

const TIME_PER_QUESTION = 120

const questions = [
  'Ceritakan satu proyek IT yang pernah kamu kerjakan. Apa bagianmu di proyek itu?',
  'Kalau aplikasimu tiba-tiba error saat demo, apa yang kamu cek pertama kali?',
  'Bagaimana caramu memastikan fitur yang kamu buat sudah sesuai kebutuhan pengguna?',
  'Pernah beda pendapat dengan teman satu tim soal kode? Bagaimana kamu menyelesaikannya?',
  'Kalau harus memakai teknologi yang belum pernah kamu pelajari, dari mana kamu mulai?',
]

// Ubah detik ke tampilan menit:detik, misalnya 119 jadi 01:59.
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

// Satu soal punya waktu dua menit. Timer baru jalan setelah Start diklik.
export function InterviewPrepTimer() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION)
  const [isRunning, setIsRunning] = useState(false)
  const timeIsUp = secondsLeft === 0

  // Selama timer jalan, kurangi sisa waktu satu detik setiap kali interval berbunyi.
  useEffect(() => {
    if (!isRunning || timeIsUp) return

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    // Bersihkan interval saat Pause, waktu habis, atau panel ditutup.
    return () => window.clearInterval(intervalId)
  }, [isRunning, timeIsUp])

  // Tombol yang sama dipakai buat mulai, jeda, dan lanjut dari sisa waktu.
  function toggleTimer() {
    setIsRunning((current) => !current)
  }

  // Balik ke 02:00 dan tunggu Start lagi.
  function resetTimer() {
    setIsRunning(false)
    setSecondsLeft(TIME_PER_QUESTION)
  }

  // Tiap pindah soal dapat dua menit baru. Setelah soal terakhir, balik ke soal pertama.
  function nextQuestion() {
    setQuestionIndex((current) => (current + 1) % questions.length)
    resetTimer()
  }

  return (
    <section aria-label="Latihan interview">
      <h2>Latihan Interview</h2>
      <p>Soal {questionIndex + 1} dari {questions.length}</p>
      <p>{questions[questionIndex]}</p>

      <p role="timer" aria-label="Sisa waktu">
        <strong>{formatTime(secondsLeft)}</strong>
      </p>

      {timeIsUp && <p role="status">Waktu habis. Ulangi soal atau lanjut ke soal berikutnya.</p>}

      <button type="button" onClick={toggleTimer} disabled={timeIsUp}>
        {isRunning && !timeIsUp ? 'Pause' : 'Start'}
      </button>{' '}
      <button type="button" onClick={resetTimer}>Reset</button>{' '}
      <button type="button" onClick={nextQuestion}>Soal Berikutnya</button>
    </section>
  )
}