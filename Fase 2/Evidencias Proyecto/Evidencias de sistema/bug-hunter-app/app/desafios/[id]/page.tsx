import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { takeChallenge } from "@/app/actions/assignments"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } },
      assignments: true
    }
  })

  if (!challenge) notFound()

  // --- LÓGICAS DE TIEMPO ---
  const limitHours = challenge.timeLimitHours ?? 6
  const isGloballyExpired = challenge.expiresAt ? new Date() > new Date(challenge.expiresAt) : false
  const globalExpirationString = challenge.expiresAt 
    ? new Date(challenge.expiresAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) 
    : "Sin fecha de cierre"

  // --- LÓGICA DE COOLDOWNS Y USUARIO ---
  const isCreator = challenge.creatorId === userId
  const userActive = challenge.assignments.some(a => a.userId === userId && ["EN_DESARROLLO", "PR_ENVIADO"].includes(a.status))
  const activeAssignmentByOther = challenge.assignments.find(a => ["EN_DESARROLLO", "PR_ENVIADO", "COMPLETADO"].includes(a.status))
  
  const hasOtherActiveTask = session?.user ? await prisma.taskAssignment.findFirst({
    where: { userId: session.user.id, status: "EN_DESARROLLO", NOT: { challengeId: challenge.id } }
  }) : null

  // Cálculo del Cooldown
  const failedAssignments = challenge.assignments.filter(a => a.userId === userId && ["EXPIRADO", "CANCELADO"].includes(a.status))
  const userFailedCount = failedAssignments.length
  let isInCooldown = false
  let isPermanentlyBlocked = userFailedCount >= 4
  let cooldownEnd: Date | null = null

  if (userFailedCount > 0 && !isPermanentlyBlocked) {
    const lastFailureTime = Math.max(...failedAssignments.map(a => {
      const updatedAt = (a as any).updatedAt ? new Date((a as any).updatedAt).getTime() : 0;
      return a.status === "CANCELADO" && updatedAt > 0 ? updatedAt : new Date(a.expiresAt).getTime();
    }))
    const cooldownHours = userFailedCount === 1 ? 0.5 : userFailedCount === 2 ? 2 : 6
    cooldownEnd = new Date(lastFailureTime + cooldownHours * 60 * 60 * 1000)
    isInCooldown = new Date() < cooldownEnd
  }

  const takeChallengeWithId = takeChallenge.bind(null, challenge.id)

  const difficultyStyles = {
    FACIL: "bg-badge-facil-bg text-badge-facil-text border-badge-facil-text/20",
    MEDIO: "bg-badge-medio-bg text-badge-medio-text border-badge-medio-text/20",
    DIFICIL: "bg-badge-dificil-bg text-badge-dificil-text border-badge-dificil-text/20",
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Aviso si ya está activo y Recordatorio de Cooldown */}
      {userActive && (
        <div className="mb-8">
          <div className="bg-bh-yellow/20 border border-bh-yellow text-bh-yellow p-4 rounded-xl text-center font-bold mb-4">
            🎯 Actualmente estás desarrollando este desafío. ¡Termina antes de que acabe el tiempo!
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-orange-400 font-bold text-sm mb-1">Recordatorio de BugHunter</h4>
              <p className="text-orange-500/80 text-xs leading-relaxed">
                Si cancelas (te rindes) o dejas que el tiempo expire, entrarás en un periodo de enfriamiento obligatorio antes de poder reintentarlo. 
                <strong className="text-orange-400 ml-1">Fallo 1: 30 min | Fallo 2: 2 horas | Fallo 3: 6 horas | Fallo 4: Bloqueo.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 text-sm text-bh-muted">
        <Link href="/desafios" className="text-bh-yellow hover:underline transition">
          ← Volver al catálogo de proyectos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${difficultyStyles[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="text-sm text-bh-muted">
                Publicado por {challenge.creator.name?.split(" ")[0] ?? "Docente"} · {new Date(challenge.createdAt).toLocaleDateString("es-CL")}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">{challenge.title}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {challenge.techStack.map(tech => (
                <span key={tech} className="bg-bh-secondary border border-bh-border text-bh-muted px-3 py-1 text-xs rounded-full font-medium">{tech}</span>
              ))}
            </div>
          </div>

          <div className="bg-bh-secondary border border-bh-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-bh-yellow mb-4">¿De qué trata el encargo?</h3>
            <div className="text-bh-muted leading-relaxed space-y-4 whitespace-pre-wrap">{challenge.description}</div>
          </div>

          <div className="bg-bh-secondary border border-bh-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-bh-yellow mb-4">Lo que se pide para aceptar la tarea</h3>
            {challenge.acceptanceCriteria && challenge.acceptanceCriteria.length > 0 ? (
              <ul className="text-bh-muted space-y-3 list-disc pl-5 leading-relaxed">
                {challenge.acceptanceCriteria.map((criterio, index) => <li key={index}>{criterio}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-500 italic">No se especificaron criterios de aceptación particulares.</p>}
          </div>
        </div>

        <div>
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4">Estado de la Tarea</h3>
            
            <div className="flex justify-between items-center mb-5 text-sm">
              <span className="text-bh-muted">Disponibilidad:</span>
              {isGloballyExpired ? (
                <span className="text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">Cerrado Globalmente</span>
              ) : activeAssignmentByOther && !userActive ? (
                <span className="text-gray-400 font-bold bg-gray-500/10 px-2.5 py-0.5 rounded border border-gray-500/20">Tomada por otro alumno</span>
              ) : (
                <span className="text-emerald-400 font-bold">Disponible</span>
              )}
            </div>

            <div className="flex justify-between mb-4 text-sm">
              <span className="text-bh-muted">Tiempo de Resolución:</span>
              <div className="text-right">
                <span className="font-bold block text-white">{limitHours} {limitHours === 1 ? "Hora" : "Horas"}</span>
                <span className="text-[10px] text-bh-muted uppercase tracking-wider">(Por Intento)</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-sm border-t border-bh-border/50 pt-4">
              <span className="text-bh-muted">Cierre del Desafío:</span>
              <div className="text-right">
                <span className={`font-bold block ${isGloballyExpired ? 'text-red-400' : 'text-white'}`}>
                  {globalExpirationString}
                </span>
                <span className="text-[10px] text-bh-muted uppercase tracking-wider">(Expiración Global)</span>
              </div>
            </div>

            <hr className="border-t border-bh-border mb-6" />

            {!session?.user ? (
              <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-300">Debes iniciar sesión para tomar este desafío.</p>
              </div>
            ) : !session.user.isGitHubLinked ? (
              <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-300">Vincula tu GitHub en la barra superior para continuar.</p>
              </div>
            ) : isCreator ? (
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-xs text-purple-300 font-bold mb-1">Eres el creador de este desafío.</p>
              </div>
            ) : isPermanentlyBlocked ? (
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-xs text-red-400 font-bold mb-1">Superaste el límite de fallos.</p>
                <p className="text-[11px] text-red-500/80">Has fallado 4 veces. Ya no puedes tomar este encargo.</p>
              </div>
            ) : isInCooldown ? (
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-xs text-orange-400 font-bold mb-1">En periodo de descanso ⏳</p>
                <p className="text-[11px] text-orange-500/80">
                  Podrás reintentarlo a las {cooldownEnd?.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ) : isGloballyExpired ? (
              <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-300">Este desafío ha finalizado y no acepta más postulaciones.</p>
              </div>
            ) : userActive ? (
              <Link href="/mis-tareas" className="w-full flex justify-center bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.3)] mb-3">
                Ir a mi espacio de trabajo ➔
              </Link>
            ) : activeAssignmentByOther ? (
              <div className="text-center p-4 bg-bh-secondary border border-bh-border rounded-xl">
                <p className="text-xs text-white font-bold mb-1">Alguien más está trabajando en esto.</p>
              </div>
            ) : hasOtherActiveTask ? (
              <div className="text-center p-4 bg-bh-secondary border border-bh-border rounded-xl">
                <p className="text-xs text-bh-muted mb-3">Ya tienes un desafío distinto en desarrollo (Límite 1/1).</p>
                <Link href="/mis-tareas" className="block w-full bg-transparent border border-bh-yellow text-bh-yellow font-bold py-2.5 rounded-lg text-sm hover:bg-bh-yellow/10 transition">
                  Ir a mis tareas activas
                </Link>
              </div>
            ) : (
              <form action={takeChallengeWithId}>
                {userFailedCount > 0 && (
                  <div className="text-center mb-3">
                    <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2.5 py-1 rounded-full border border-orange-500/30 font-bold uppercase tracking-wider">
                      Intento {userFailedCount + 1} de 4
                    </span>
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.3)] hover:shadow-[0_0_25px_rgba(245,166,35,0.5)] mb-3 cursor-pointer">
                  {userFailedCount > 0 ? "Reintentar Desafío ➔" : "Tomar este Desafío ➔"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}