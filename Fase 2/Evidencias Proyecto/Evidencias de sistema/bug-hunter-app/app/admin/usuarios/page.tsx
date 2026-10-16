import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserRoleSelect } from "@/components/user-role-select"

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

      {/* Tabla de Usuarios */}
      <div className="bg-bh-card border border-bh-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-bh-muted">
            <thead className="bg-bh-primary border-b border-bh-border text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Correo Institucional</th>
                <th className="px-6 py-4">GitHub</th>
                <th className="px-6 py-4 text-center">Desafíos Tomados</th>
                <th className="px-6 py-4">Rol Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bh-border">
              {users.map((user) => {
                const hasGitHub = user.accounts.some(acc => acc.provider === "github") || Boolean(user.githubUsername)
                const isCurrentUser = session.user.id === user.id

                return (
                  <tr key={user.id} className="hover:bg-bh-primary/30 transition">
                    
                    {/* Usuario / Avatar */}
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name ?? "User"} 
                          className="w-9 h-9 rounded-full border border-bh-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-bh-yellow text-black flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0) ?? "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{user.name ?? "Sin nombre"}</p>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-bh-yellow/20 text-bh-yellow border border-bh-yellow/30 px-1.5 py-0.5 rounded font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">
                      {user.email}
                    </td>

                    {/* Estado GitHub */}
                    <td className="px-6 py-4">
                      {hasGitHub ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          @{user.githubUsername ?? "Vinculado"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-bh-muted bg-bh-primary border border-bh-border px-2.5 py-1 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Cantidad de desafíos */}
                    <td className="px-6 py-4 text-xs text-center font-mono text-gray-300">
                      {user.assignments.length}
                    </td>

                    {/* Selector de Rol en Client Component */}
                    <td className="px-6 py-4">
                      <UserRoleSelect 
                        userId={user.id}
                        currentRole={user.role}
                        isCurrentUser={isCurrentUser}
                      />
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  )
}