"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Difficulty } from "@prisma/client"

export async function createChallenge(formData: FormData) {
  const session = await auth()

  // 1. Doble validación de seguridad (solo docentes o administradores)
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CREATOR")) {
    throw new Error("No tienes permisos para crear desafíos.")
  }

  // 2. Extraer los datos del formulario
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const criteriaString = formData.get("acceptanceCriteria") as string // <-- NUEVO
  const difficulty = formData.get("difficulty") as Difficulty
  const repoUrl = formData.get("repoUrl") as string
  const techStackString = formData.get("techStack") as string

  // 3. Formatear las tecnologías (separadas por comas)
  const techStack = techStackString
    .split(",")
    .map(tech => tech.trim())
    .filter(tech => tech.length > 0)

  // 4. Formatear los criterios (separados por salto de línea enter)
  const acceptanceCriteria = criteriaString
    .split("\n")
    .map(criteria => criteria.trim())
    .filter(criteria => criteria.length > 0)

  // 5. Guardar en la base de datos de PostgreSQL
  await prisma.challenge.create({
    data: {
      title,
      description,
      acceptanceCriteria,
      difficulty,
      techStack,
      repoUrl,
      creatorId: session.user.id
    }
  })

  // 6. Refrescar la página principal y redirigir
  revalidatePath("/")
  redirect("/")
}