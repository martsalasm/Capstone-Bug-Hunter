"use client"

import { useEffect, useState } from "react"

export function Countdown({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
        setTimeLeft("00:00:00")
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  if (isExpired) {
    return <span className="text-red-500 font-bold">Tiempo expirado</span>
  }

  return <span className="font-mono text-bh-yellow font-bold tracking-wider">{timeLeft}</span>
}