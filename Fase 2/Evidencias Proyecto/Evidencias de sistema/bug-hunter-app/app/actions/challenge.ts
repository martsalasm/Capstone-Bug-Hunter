"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Difficulty } from "@prisma/client"

export async function createChallenge(formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CREATOR")) {
    throw new Error("No tienes permisos para crear desafíos.")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const repoUrl = formData.get("repoUrl") as string
  const difficulty = formData.get("difficulty") as Difficulty
  const techStackRaw = formData.get("techStack") as string
  
  // Nuevos campos de tiempo
  const timeLimitHours = parseInt(formData.get("timeLimitHours") as string || "6", 10)
  const expiresAtRaw = formData.get("expiresAt") as string
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  const techStack = techStackRaw
    .split(",")
    .map(tech => tech.trim())
    .filter(Boolean)

  await prisma.challenge.create({
    data: {
      title,
      description,
      repoUrl,
      difficulty,
      techStack,
      timeLimitHours,
      expiresAt,
      creatorId: session.user.id
    }
  })

  redirect("/admin/mis-desafios")
}