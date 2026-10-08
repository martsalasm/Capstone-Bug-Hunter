"use client"

import { useEffect, useState } from "react"

export function Countdown({ expiresAt }: { expiresAt: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("Calculando...")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Aseguramos que sea un timestamp válido
    const targetDate = new Date(expiresAt).getTime()

    const calculateTime = () => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance <= 0) {
        setIsExpired(true)
        setTimeLeft("00:00:00")
        return false // Indica que ya expiró y debe detener el intervalo
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
      return true
    }

    // Ejecutar inmediatamente antes de iniciar el intervalo
    const shouldContinue = calculateTime()

    if (shouldContinue) {
      const interval = setInterval(() => {
        const stillGoing = calculateTime()
        if (!stillGoing) clearInterval(interval)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [expiresAt])

  if (isExpired) {
    return <span className="text-red-500 font-bold">Tiempo expirado</span>
  }

  return <span className="font-mono text-bh-yellow font-bold tracking-wider">{timeLeft}</span>
}