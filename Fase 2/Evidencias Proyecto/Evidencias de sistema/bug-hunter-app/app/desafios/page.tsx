import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ChallengesCatalogPage() {
  const session = await auth()
  const userId = session?.user?.id

  // Obtenemos todos los desafíos con sus creadores y asignaciones
  const challenges = await prisma.challenge.findMany({
    include: {
      creator: { select: { name: true } },
      assignments: true
    },
    orderBy: { createdAt: "desc" }
  })

  const difficultyStyles = {
    FACIL: "bg-badge-facil-bg text-badge-facil-text border-badge-facil-text/20",
    MEDIO: "bg-badge-medio-bg text-badge-medio-text border-badge-medio-text/20",
    DIFICIL: "bg-badge-dificil-bg text-badge-dificil-text border-badge-dificil-text/20",
  }

  const now = new Date()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      
      {/* --- ENCABEZADO Y REGLAS DE COOLDOWN --- */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Catálogo de Desafíos</h1>
        <p className="text-bh-muted max-w-2xl mx-auto mb-6">
          Encuentra un problema, postula a la tarea y envía tu Pull Request antes de que se acabe el tiempo. 
          Recuerda: Solo un alumno puede trabajar en una tarea a la vez.
        </p>

        {/* Caja de Reglas / Gamificación */}
        <div className="mt-6 bg-bh-secondary/40 border border-bh-border p-5 rounded-2xl max-w-3xl mx-auto text-left shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">⏳</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Sistema de Intentos y Penalizaciones</h3>
          </div>
          <p className="text-bh-muted text-sm mb-4">
            En BugHunter cuentas con <strong className="text-white">1 intento principal y hasta 3 reintentos</strong> por tarea. 
            Si tu tiempo expira o no logras cumplir el objetivo, entrarás en un periodo de enfriamiento antes de poder postular nuevamente al mismo desafío:
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              1° Fallo: Espera de 30 min
            </span>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              2° Fallo: Espera de 2 horas
            </span>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              3° Fallo: Espera de 6 horas
            </span>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              4° Fallo: Bloqueo Permanente
            </span>
          </div>
        </div>
      </div>

      {/* --- GRILLA DE DESAFÍOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          // --- LÓGICA DE ESTADOS DEL DESAFÍO (CON COOLDOWNS) ---
          const isCreator = challenge.creatorId === userId
          const userActive = challenge.assignments.some(a => a.userId === userId && ["EN_DESARROLLO", "PR_ENVIADO"].includes(a.status))
          const activeAssignment = challenge.assignments.find(a => ["EN_DESARROLLO", "PR_ENVIADO", "COMPLETADO"].includes(a.status))
          
          const failedAssignments = challenge.assignments.filter(a => a.userId === userId && ["EXPIRADO", "CANCELADO"].includes(a.status))
          const userFailedCount = failedAssignments.length
          let isInCooldown = false
          let isPermanentlyBlocked = userFailedCount >= 4

          if (userFailedCount > 0 && !isPermanentlyBlocked) {
            const lastFailureTime = Math.max(...failedAssignments.map(a => {
              const updatedAt = (a as any).updatedAt ? new Date((a as any).updatedAt).getTime() : 0;
              return a.status === "CANCELADO" && updatedAt > 0 ? updatedAt : new Date(a.expiresAt).getTime();
            }))
            const cooldownHours = userFailedCount === 1 ? 0.5 : userFailedCount === 2 ? 2 : 6
            isInCooldown = now.getTime() < lastFailureTime + cooldownHours * 60 * 60 * 1000
          }

          let statusBadge = null
          let borderStyle = "border-bh-border hover:border-bh-yellow/40"
          let opacityStyle = ""

          if (isCreator) {
            statusBadge = <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">Tu Desafío (Creador)</span>
          } else if (userActive) {
            statusBadge = <span className="bg-bh-yellow/20 text-bh-yellow text-xs px-2 py-1 rounded border border-bh-yellow/30 font-bold">🎯 Tu Tarea Actual</span>
            borderStyle = "border-bh-yellow shadow-[0_0_15px_rgba(245,166,35,0.15)]"
          } else if (activeAssignment) {
            opacityStyle = "opacity-70 grayscale-[20%]"
            if (activeAssignment.status === "COMPLETADO") {
              statusBadge = <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">✅ Resuelto</span>
              borderStyle = "border-emerald-500/30"
            } else {
              statusBadge = <span className="bg-gray-500/20 text-gray-300 text-xs px-2 py-1 rounded">🔒 Tomado por otro alumno</span>
              borderStyle = "border-gray-700"
            }
          } else if (isPermanentlyBlocked) {
            statusBadge = <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">❌ Bloqueado</span>
            borderStyle = "border-red-500/30"
            opacityStyle = "opacity-50 grayscale"
          } else if (isInCooldown) {
            statusBadge = <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/30 font-bold">⏳ En Descanso</span>
            borderStyle = "border-orange-500/40"
          } else {
            statusBadge = <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/20 font-bold">
              {userFailedCount > 0 ? "🟢 Disponible (Reintento)" : "🟢 Disponible"}
            </span>
          }

          return (
            <div key={challenge.id} className={`bg-bh-card border rounded-2xl p-6 transition flex flex-col ${borderStyle} ${opacityStyle}`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${difficultyStyles[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  {statusBadge}
                </div>
                <span className="text-xs font-bold text-bh-muted bg-[#0D1117] px-3 py-1 rounded-full">
                  ⏱️ {challenge.timeLimitHours} hrs
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
              <p className="text-sm text-bh-muted line-clamp-2 mb-4 flex-1">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between border-t border-bh-border pt-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {challenge.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="bg-bh-secondary text-bh-muted text-[11px] px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {challenge.techStack.length > 3 && (
                    <span className="text-bh-muted text-xs">+{challenge.techStack.length - 3}</span>
                  )}
                </div>
                
                <Link 
                  href={`/desafios/${challenge.id}`}
                  className="bg-bh-secondary hover:bg-bh-border border border-bh-border text-white text-xs font-bold px-5 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Ver Detalles
                </Link>
              </div>

            </div>
          )
        })}
      </div>
    </main>
  )
}