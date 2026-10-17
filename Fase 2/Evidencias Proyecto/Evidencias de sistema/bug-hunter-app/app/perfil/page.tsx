import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/")
  }

  // Traer los datos del usuario logueado y su historial de tareas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: true,
      assignments: {
        include: { challenge: true },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!user) redirect("/")

  // Tarea activa actualmente (si existe)
  const activeTask = user.assignments.find(
    a => a.status === "EN_DESARROLLO" || a.status === "PR_ENVIADO"
  )

  // Tareas completadas
  const completedTasks = user.assignments.filter(a => a.status === "COMPLETADO")
  const completedCount = completedTasks.length

  // Sistema de rangos basado en la escala definida
  let rankName = "Explorador"
  let rankColor = "text-gray-400"
  
  if (completedCount >= 1 && completedCount <= 5) {
    rankName = "Novato"
    rankColor = "text-emerald-400"
  } else if (completedCount >= 6 && completedCount <= 9) {
    rankName = "Amateur"
    rankColor = "text-blue-400"
  } else if (completedCount >= 10 && completedCount <= 15) {
    rankName = "Establecido"
    rankColor = "text-purple-400"
  } else if (completedCount >= 16 && completedCount <= 24) {
    rankName = "Contribuidor Destacado"
    rankColor = "text-bh-yellow"
  } else if (completedCount >= 25) {
    rankName = "Top Tier"
    rankColor = "text-red-500 font-black drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      <div className="text-sm text-bh-muted">
        <Link href="/" className="text-bh-yellow hover:underline transition">
          ← Volver al listado de proyectos
        </Link>
      </div>

      {/* CABECERA DEL PERFIL */}
      <div className="bg-bh-card border border-bh-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bh-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Avatar grande */}
        <div className="relative">
          {user.image ? (
            <img 
              src={user.image} 
              alt={user.name ?? "Avatar"} 
              className="w-32 h-32 rounded-full border-4 border-bh-primary shadow-xl z-10 relative"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-bh-yellow text-black flex items-center justify-center font-black text-4xl border-4 border-bh-primary shadow-xl z-10 relative">
              {user.name?.charAt(0) ?? "U"}
            </div>
          )}
          {/* Badge flotante de rol */}
          <div className="absolute -bottom-2 right-2 bg-bh-primary border border-bh-border text-xs font-bold px-3 py-1 rounded-full text-white z-20">
            {user.role}
          </div>
        </div>

        {/* Info del Usuario */}
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">{user.name}</h1>
          <p className="text-bh-muted font-mono mb-4">{user.email}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            {user.githubUsername && (
              <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#24292F] hover:bg-[#1a1e22] border border-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                <span>GitHub: @{user.githubUsername}</span>
              </a>
            )}
            <span className="bg-bh-primary border border-bh-border text-bh-muted text-xs font-medium px-3 py-1.5 rounded-lg">
              Miembro desde {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DESAFÍO ACTIVO (SI EXISTE) */}
      {activeTask && (
        <div className="bg-bh-card border border-bh-yellow/40 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bh-yellow to-amber-600"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {activeTask.status === "PR_ENVIADO" ? "EN REVISIÓN (PR)" : "DESAFÍO EN PROGRESO"}
                </span>
                <span className="text-xs text-bh-muted">1 / 1 en desarrollo</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {activeTask.challenge.title}
              </h3>
              <p className="text-xs text-bh-muted font-mono">
                Rama asignada: <span className="text-emerald-400 font-bold">{activeTask.branchName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link 
                href="/mis-tareas"
                className="w-full md:w-auto text-center bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.2)]"
              >
                Ir a Mi Panel de Tareas ➔
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE GAMIFICACIÓN / LOGROS */}
      <div className="bg-[#151D2C] border border-bh-border rounded-3xl p-8 md:p-12 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold tracking-widest text-bh-muted uppercase mb-2">Nivel Actual</h2>
          <div className={`text-3xl font-black uppercase tracking-tight ${rankColor} drop-shadow-md`}>
            {rankName}
          </div>
        </div>

        {/* El Mostrador de Estrellas */}
        <div className="bg-bh-primary border border-bh-border rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-6">Desafíos Completados con Éxito ({completedCount})</h3>
          
          {completedCount === 0 ? (
            <p className="text-sm text-bh-muted italic">
              Aún no tienes estrellas. ¡Toma tu primer desafío y envía el Pull Request para ganar la primera!
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: completedCount }).map((_, index) => (
                <div 
                  key={index} 
                  className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,166,35,0.2)] animate-pulse"
                  style={{ animationDelay: `${index * 150}ms` }}
                  title={`Desafío #${index + 1} completado`}
                >
                  ⭐
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HISTORIAL DETALLADO DE ÉXITOS */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-bh-border pb-2">Registro de Contribuciones</h3>
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div key={task.id} className="bg-bh-card border border-emerald-500/20 rounded-xl p-5 flex items-center justify-between hover:border-emerald-500/40 transition">
                <div>
                  <h4 className="text-white font-bold mb-1">{task.challenge.title}</h4>
                  <p className="text-xs text-bh-muted">Rama resuelta: <span className="font-mono text-emerald-400">{task.branchName}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/20">
                    Completado
                  </span>
                  <p className="text-[10px] text-bh-muted mt-2">
                    {new Date(task.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  )
}