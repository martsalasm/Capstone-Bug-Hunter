"use client"

import { Role } from "@prisma/client"
import { updateUserRole } from "@/app/actions/user"
import { useTransition } from "react"

interface UserRoleSelectProps {
  userId: string
  currentRole: Role
  isCurrentUser: boolean
}

export function UserRoleSelect({ userId, currentRole, isCurrentUser }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role
    
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole)
      } catch (error) {
        console.error("Error al actualizar rol:", error)
        alert("No se pudo cambiar el rol del usuario.")
      }
    })
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={isCurrentUser || isPending}
      onChange={handleRoleChange}
      className="bg-bh-secondary border border-bh-border text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-bh-yellow transition disabled:opacity-50 cursor-pointer"
    >
      <option value="STUDENT">STUDENT (Estudiante)</option>
      <option value="CREATOR">CREATOR (Docente)</option>
      <option value="ADMIN">ADMIN (Administrador)</option>
    </select>
  )
}