"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth()

  // 1. Validar que el usuario que ejecuta la acción sea ADMIN
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No tienes permisos para modificar roles de usuario.")
  }

  // 2. Prevenir que un ADMIN se quite el rol a sí mismo por error
  if (session.user.id === userId && newRole !== "ADMIN") {
    throw new Error("No puedes quitarte el rol de ADMIN a ti mismo.")
  }

  // 3. Actualizar en PostgreSQL
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })

  // 4. Refrescar la vista
  revalidatePath("/admin/usuarios")
}