"use client"

import { useState } from "react"
import { UserRoleSelect } from "@/components/user-role-select"

interface UserData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  githubUsername: string | null
  role: string
  hasGitHub: boolean
  assignmentsCount: number
  isCurrentUser: boolean
}

interface Props {
  initialUsers: UserData[]
}

export function UsersTableClient({ initialUsers }: Props) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = initialUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const nameMatch = user.name?.toLowerCase().includes(searchLower) ?? false
    const emailMatch = user.email?.toLowerCase().includes(searchLower) ?? false
    return nameMatch || emailMatch
  })

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda */}
      <div className="bg-bh-card border border-bh-border rounded-xl p-4 flex items-center gap-3">
        <span className="text-bh-muted text-lg">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar usuario por nombre o correo institucional..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-white placeholder-bh-muted focus:outline-none text-sm"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="text-bh-muted hover:text-white transition"
          >
            ✖
          </button>
        )}
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-bh-muted">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-bh-primary/30 transition">
                    
                    {/* Usuario / Avatar */}
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name ?? "User"} 
                          className="w-9 h-9 rounded-full border border-bh-border object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-bh-yellow text-black flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0) ?? "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{user.name ?? "Sin nombre"}</p>
                        {user.isCurrentUser && (
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
                      {user.hasGitHub ? (
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
                      {user.assignmentsCount}
                    </td>

                    {/* Selector de Rol en Client Component */}
                    <td className="px-6 py-4">
                      <UserRoleSelect 
                        userId={user.id}
                        currentRole={user.role as any}
                        isCurrentUser={user.isCurrentUser}
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}