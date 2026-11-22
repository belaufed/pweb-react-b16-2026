import { useEffect, useState } from 'react'

// Aku pakai hook ini biar hasil pencarian baru berubah setelah ada jeda ngetik.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(() => value)

  // Tiap input atau lama jedanya berubah, mulai hitung waktunya lagi.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Jeda udah lewat, sekarang pakai input terbaru.
      setDebouncedValue(() => value)
    }, delay)

    // Kalau aku ngetik lagi atau pindah halaman, batalkan timer sebelumnya.
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}