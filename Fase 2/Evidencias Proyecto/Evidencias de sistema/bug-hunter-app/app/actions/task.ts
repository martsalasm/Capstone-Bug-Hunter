"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function takeChallenge(challengeId: string) {
  const session = await auth()

  // 1. Validar seguridad: Debe estar logueado y tener GitHub vinculado
  if (!session?.user || !session.user.isGitHubLinked) {
    throw new Error("No estás autorizado o falta vincular GitHub.")
  }

  const userId = session.user.id

  // 2. Consultar el desafío para leer su configuración de límites de tiempo
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId }
  })

  if (!challenge) {
    throw new Error("El desafío especificado no existe.")
  }

  // Validar si el desafío ya cerró a nivel global
  if (challenge.expiresAt && new Date() > new Date(challenge.expiresAt)) {
    throw new Error("Este desafío ya ha finalizado y no acepta más postulaciones.")
  }

  // 3. Regla de negocio: ¿Ya tiene una tarea en desarrollo?
  const activeTask = await prisma.taskAssignment.findFirst({
    where: {
      userId: userId,
      status: "EN_DESARROLLO"
    }
  })

  if (activeTask) {
    throw new Error("Ya tienes un desafío activo. Termínalo o cancélalo antes de tomar otro.")
  }

  // 4. Generar metadata temporal para la tarea
  const githubUser = session.user.githubUsername ?? "dev"
  const branchName = `bh-${githubUser}-${Date.now().toString().slice(-6)}`
  
  // Plazo individual dinámico definido por el docente (en horas)
  const hours = challenge.timeLimitHours ?? 6
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)

  // 5. Insertar en PostgreSQL mediante Prisma
  await prisma.taskAssignment.create({
    data: {
      userId,
      challengeId,
      branchName,
      expiresAt,
      status: "EN_DESARROLLO"
    }
  })

  // 6. Limpiar caché y redirigir al panel del estudiante
  revalidatePath("/mis-tareas")
  revalidatePath("/")
  redirect("/mis-tareas")
}

export async function cancelTask(assignmentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")

  await prisma.taskAssignment.update({
    where: { 
      id: assignmentId,
      userId: session.user.id
    },
    data: { status: "CANCELADO" }
  })

  revalidatePath("/mis-tareas")
  revalidatePath("/")
}

export async function checkAndExpireTasks(userId: string) {
  const now = new Date()

  // Buscamos y actualizamos de un solo golpe todas las tareas vencidas
  const result = await prisma.taskAssignment.updateMany({
    where: {
      userId: userId,
      status: "EN_DESARROLLO",
      expiresAt: {
        lt: now // Menor a la fecha/hora actual
      }
    },
    data: { status: "EXPIRADO" }
  })

  return result.count > 0
}