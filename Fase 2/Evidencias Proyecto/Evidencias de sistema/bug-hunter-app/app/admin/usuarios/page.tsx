import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UsersTableClient } from "./UsersTableClient"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const session = await auth()

  // Protección de ruta: Solo los usuarios con rol ADMIN pueden entrar
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Consultar todos los usuarios registrados con sus cuentas vinculadas
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        select: { provider: true }
      },
      assignments: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Pasar los datos serializables al componente cliente
  const plainUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    githubUsername: user.githubUsername,
    role: user.role,
    hasGitHub: user.accounts.some(acc => acc.provider === "github") || Boolean(user.githubUsername),
    assignmentsCount: user.assignments.length,
    isCurrentUser: session.user.id === user.id
  }))

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-bh-border gap-4">
        <div>
          <Link href="/" className="text-sm text-bh-muted hover:text-white transition">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-extrabold text-white mt-2">Gestión de Usuarios</h1>
          <p className="text-bh-muted text-sm mt-1">
            Administra los roles de acceso (Estudiantes, Creadores y Administradores) de la plataforma.
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/crear-desafio" 
            className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <span>+ Publicar Desafío</span>
          </Link>
        </div>
      </div>

      {/* Componente Cliente para la Tabla con Búsqueda */}
      <UsersTableClient initialUsers={plainUsers} />

    </main>
  )
}