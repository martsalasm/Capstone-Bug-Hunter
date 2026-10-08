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

  // 2. Regla de negocio: ¿Ya tiene una tarea en desarrollo?
  const activeTask = await prisma.taskAssignment.findFirst({
    where: {
      userId: userId,
      status: "EN_DESARROLLO"
    }
  })

  if (activeTask) {
    throw new Error("Ya tienes un desafío activo. Termínalo o cancélalo antes de tomar otro.")
  }

  // 3. Generar metadata temporal para la tarea
  // Creamos un nombre de rama único usando su usuario de github y los últimos 6 números del timestamp
  const githubUser = session.user.githubUsername ?? "dev"
  const branchName = `bh-${githubUser}-${Date.now().toString().slice(-6)}`
  
  // Plazo de 6 horas desde este momento exacto
  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000)

  // 4. Insertar en PostgreSQL mediante Prisma
  await prisma.taskAssignment.create({
    data: {
      userId,
      challengeId,
      branchName,
      expiresAt,
      status: "EN_DESARROLLO"
    }
  })

  // 5. Limpiar caché y redirigir al panel del estudiante
  revalidatePath("/mis-tareas")
  revalidatePath("/")
  redirect("/mis-tareas")
}


export async function cancelTask(assignmentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")

  // Actualizamos el estado de la tarea a CANCELADO
  await prisma.taskAssignment.update({
    where: { 
      id: assignmentId,
      userId: session.user.id // Medida de seguridad: solo el dueño puede cancelarla
    },
    data: { status: "CANCELADO" }
  })

  revalidatePath("/mis-tareas")
  revalidatePath("/")
}