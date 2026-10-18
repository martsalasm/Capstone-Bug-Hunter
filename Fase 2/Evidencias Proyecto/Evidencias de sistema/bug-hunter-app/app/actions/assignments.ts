"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function takeChallenge(challengeId: string) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Debes iniciar sesión para postular a un desafío.")
  }

  const userId = session.user.id

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { assignments: true }
  })

  if (!challenge) throw new Error("Desafío no encontrado.")

  // REGLA 1: El creador no puede resolverlo
  if (challenge.creatorId === userId) {
    throw new Error("No puedes resolver un desafío que tú mismo creaste.")
  }

  // REGLA 2: Lógica de Intentos y Cooldowns
  const failedAssignments = challenge.assignments.filter(
    a => a.userId === userId && ["EXPIRADO", "CANCELADO"].includes(a.status)
  )
  const failedCount = failedAssignments.length

  if (failedCount >= 4) {
    throw new Error("Has alcanzado el límite máximo de intentos fallidos para esta tarea.")
  }

  if (failedCount > 0) {
    // Buscar el momento exacto del último fallo (usando updatedAt si canceló, o expiresAt si expiró el tiempo)
    const lastFailureTime = Math.max(...failedAssignments.map(a => {
      const updatedAt = (a as any).updatedAt ? new Date((a as any).updatedAt).getTime() : 0;
      return a.status === "CANCELADO" && updatedAt > 0 ? updatedAt : new Date(a.expiresAt).getTime();
    }))

    // Asignar el tiempo de castigo: 1 fallo = 0.5h, 2 fallos = 2h, 3 fallos = 6h
    const cooldownHours = failedCount === 1 ? 0.5 : failedCount === 2 ? 2 : 6
    const cooldownEnd = new Date(lastFailureTime + cooldownHours * 60 * 60 * 1000)

    if (new Date() < cooldownEnd) {
      throw new Error(`Estás en periodo de enfriamiento. Puedes reintentarlo a las ${cooldownEnd.toLocaleTimeString("es-CL", {hour: '2-digit', minute:'2-digit'})}.`)
    }
  }

  // REGLA 3: Concurrencia global (¿Alguien más lo tiene activo ahora mismo?)
  const isTaken = challenge.assignments.some(
    a => ["EN_DESARROLLO", "PR_ENVIADO", "COMPLETADO"].includes(a.status)
  )
  if (isTaken) {
    throw new Error("Esta tarea ya ha sido tomada por otro alumno o ya fue resuelta.")
  }

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + challenge.timeLimitHours)
  const branchName = `bh-dev-${userId.split('-')[0]}-${challengeId.split('-')[0]}`

  await prisma.taskAssignment.create({
    data: {
      userId,
      challengeId,
      branchName,
      expiresAt,
      status: "EN_DESARROLLO"
    }
  })

  revalidatePath("/desafios")
  revalidatePath("/mis-tareas")
  redirect("/mis-tareas")
}