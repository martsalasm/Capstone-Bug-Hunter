"use client"

import { deleteChallenge } from "@/app/actions/challenge"
import { useTransition } from "react"

export default function DeleteChallengeButton({ challengeId }: { challengeId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm("¿Estás seguro de eliminar este desafío de la plataforma? Todos los alumnos que lo estén realizando perderán su progreso.")) {
          startTransition(() => {
            deleteChallenge(challengeId)
          })
        }
      }}
      disabled={isPending}
      className="text-red-500 hover:text-red-400 text-xs font-bold px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  )
}