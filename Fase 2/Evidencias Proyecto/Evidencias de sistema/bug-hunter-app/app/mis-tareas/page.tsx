import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Countdown } from "@/components/countdown"
import { cancelTask, checkAndExpireTasks } from "@/app/actions/task"

export const dynamic = "force-dynamic"

export default async function StudentDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  // 1. EJECUTAR LIMPIEZA DE EXPIRACIONES ANTES DE CONSULTAR
  await checkAndExpireTasks(session.user.id)

  // 2. Traer los datos actualizados
  const assignments = await prisma.taskAssignment.findMany({
    where: { userId: session.user.id },
    include: { challenge: true },
    orderBy: { createdAt: "desc" }
  })

  const activeTask = assignments.find(task => 
    task.status === "EN_DESARROLLO" || task.status === "PR_ENVIADO"
  )
  
  const historyTasks = assignments.filter(task => 
    task.status !== "EN_DESARROLLO" && task.status !== "PR_ENVIADO"
  )

  const usageText = activeTask ? "1 / 1 en uso" : "0 / 1 en uso"
  const usageColor = activeTask ? "text-bh-yellow" : "text-emerald-400"

  // --- CÁLCULO DEL PRÓXIMO CASTIGO (Si se rinde) ---
  let nextPenaltyText = ""
  if (activeTask) {
    const failedAttempts = assignments.filter(a => 
      a.challengeId === activeTask.challengeId && 
      ["EXPIRADO", "CANCELADO"].includes(a.status)
    ).length

    if (failedAttempts === 0) {
      nextPenaltyText = "Enfriamiento: 30 minutos"
    } else if (failedAttempts === 1) {
      nextPenaltyText = "Enfriamiento: 2 horas"
    } else if (failedAttempts === 2) {
      nextPenaltyText = "Enfriamiento: 6 horas"
    } else {
      nextPenaltyText = "Bloqueo permanente"
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-bh-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Mi Panel de Trabajo</h1>
          <p className="text-bh-muted mt-2">Gestiona tus desarrollos activos y revisa tu historial.</p>
        </div>
        <div className="bg-bh-card border border-bh-border px-4 py-2 rounded-lg text-sm">
          Límite de tareas activas: <span className={`font-bold ml-1 ${usageColor}`}>{usageText}</span>
        </div>
      </div>

      {/* SECCIÓN 1: Tarea Activa */}
      <section className="mb-14">
        <h2 className="text-lg font-bold text-white mb-4">Desafío Actual</h2>
        
        {!activeTask ? (
          <div className="bg-bh-card border border-bh-border border-dashed rounded-xl p-10 text-center flex flex-col items-center">
            <div className="text-4xl mb-4">☕</div>
            <h3 className="text-white font-semibold mb-2">No tienes ningún desafío activo</h3>
            <p className="text-bh-muted text-sm mb-6 max-w-md">
              Ve al explorador de proyectos, elige un ticket de tu nivel y comienza a codear.
            </p>
            <Link href="/#proyectos" className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition">
              Explorar Desafíos
            </Link>
          </div>
        ) : activeTask.status === "PR_ENVIADO" ? (
          <div className="bg-[#1a1625] border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.05)] rounded-xl p-8 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
            <div className="text-5xl mb-4">👀</div>
            <h3 className="text-xl font-bold text-white mb-2">Solución enviada con éxito</h3>
            <p className="text-bh-muted text-sm max-w-lg mx-auto mb-6">
              Hemos detectado tu Pull Request en la rama <strong className="text-purple-400">{activeTask.branchName}</strong>. 
              El desafío <strong>"{activeTask.challenge.title}"</strong> está en revisión. Cuando el docente haga el merge en GitHub, el estado cambiará a Completado automáticamente.
            </p>
            <a href={activeTask.challenge.repoUrl} target="_blank" rel="noreferrer" className="inline-block bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-semibold px-6 py-2.5 rounded-lg text-sm transition">
              Ver Pull Request en GitHub
            </a>
          </div>
        ) : (
          <div className="bg-[#151D2C] border border-bh-yellow/50 shadow-[0_0_30px_rgba(245,166,35,0.05)] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bh-yellow to-amber-600"></div>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md uppercase tracking-wider">
                    EN PROGRESO
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {activeTask.challenge.title}
                </h3>
                <div className="bg-bh-primary/50 border border-bh-border rounded-lg p-3 inline-block">
                  <p className="text-xs text-bh-muted mb-1">Nombre de tu rama (Branch asignada):</p>
                  <code className="text-sm font-mono text-emerald-400 font-bold select-all">
                    {activeTask.branchName}
                  </code>
                </div>
              </div>
              <div className="md:w-72 bg-bh-primary border border-bh-border rounded-xl p-5 flex flex-col justify-between">
                <div className="text-center mb-4">
                  <p className="text-xs text-bh-muted uppercase tracking-wider font-semibold mb-1">Tiempo Restante</p>
                  <div className="text-3xl">
                    {/* ENVIAMOS LA FECHA COMO ISOString PARA EVITAR FALLOS DE ZONA HORARIA */}
                    <Countdown expiresAt={activeTask.expiresAt.toISOString()} />
                  </div>
                </div>
                <div className="space-y-2">
                  <a href={activeTask.challenge.repoUrl} target="_blank" rel="noreferrer" className="block w-full text-center bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold py-2 rounded-lg text-sm transition">
                    Ver Repositorio
                  </a>
                  
                  {/* --- AVISO DE PENALIZACIÓN --- */}
                  <div className="mt-4 pt-4 border-t border-red-500/20 text-center">
                    <p className="text-[10px] text-red-400 mb-2 leading-tight">
                      Si te rindes ahora aplicarás a tu próximo intento:<br/>
                      <strong className="font-bold">{nextPenaltyText}</strong>
                    </p>
                    <form action={cancelTask.bind(null, activeTask.id)}>
                      <button type="submit" className="w-full bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold py-2 rounded-lg text-sm transition">
                        Rendirme (Liberar cupo)
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Historial */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 border-b border-bh-border pb-2">Tu Historial</h2>
        {historyTasks.length === 0 ? (
          <p className="text-sm text-bh-muted">Aún no tienes tareas completadas o canceladas en tu historial.</p>
        ) : (
          <div className="bg-bh-card border border-bh-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-bh-muted">
              <thead className="bg-bh-primary border-b border-bh-border text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">Desafío</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bh-border">
                {historyTasks.map(task => (
                  <tr key={task.id} className="hover:bg-bh-primary/30 transition">
                    <td className="px-6 py-4 font-medium text-gray-300">{task.challenge.title}</td>
                    <td className="px-6 py-4">
                      {task.status === "COMPLETADO" && <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs border border-emerald-400/20">Completado</span>}
                      {task.status === "CANCELADO" && <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs border border-red-400/20">Cancelado</span>}
                      {task.status === "EXPIRADO" && <span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded text-xs border border-amber-400/20">Expirado</span>}
                    </td>
                    <td className="px-6 py-4">{new Date(task.createdAt).toLocaleDateString("es-CL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  )
}