import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { takeChallenge } from "@/app/actions/task"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } }
    }
  })

  if (!challenge) notFound()

  const activeTask = session?.user ? await prisma.taskAssignment.findFirst({
    where: { userId: session.user.id, status: "EN_DESARROLLO" }
  }) : null

  const hasActiveTask = Boolean(activeTask)
  const takeChallengeWithId = takeChallenge.bind(null, challenge.id)

  const estimatedExpiration = new Date(Date.now() + 6 * 60 * 60 * 1000)
  const expirationTime = estimatedExpiration.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
  const expirationDate = estimatedExpiration.toLocaleDateString("es-CL")

  const difficultyStyles = {
    FACIL: "bg-badge-facil-bg text-badge-facil-text border-badge-facil-text/20",
    MEDIO: "bg-badge-medio-bg text-badge-medio-text border-badge-medio-text/20",
    DIFICIL: "bg-badge-dificil-bg text-badge-dificil-text border-badge-dificil-text/20",
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 text-sm text-bh-muted">
        <Link href="/" className="text-bh-yellow hover:underline transition">
          ← Volver al listado de proyectos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Información del Desafío */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${difficultyStyles[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="text-sm text-bh-muted">
                Publicado por {challenge.creator.name?.split(" ")[0] ?? "Docente"} • {new Date(challenge.createdAt).toLocaleDateString("es-CL")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              {challenge.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {challenge.techStack.map(tech => (
                <span key={tech} className="bg-bh-secondary border border-bh-border text-bh-muted px-3 py-1 text-xs rounded-full font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Caja: ¿De qué trata el encargo? */}
          <div className="bg-bh-secondary border border-bh-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-bh-yellow mb-4">¿De qué trata el encargo?</h3>
            <div className="text-bh-muted leading-relaxed space-y-4 whitespace-pre-wrap">
              {challenge.description}
            </div>
          </div>

          {/* Caja: Criterios de Aceptación DINÁMICOS */}
          <div className="bg-bh-secondary border border-bh-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-bh-yellow mb-4">Lo que se pide para aceptar la tarea</h3>
            
            {challenge.acceptanceCriteria.length > 0 ? (
              <ul className="text-bh-muted space-y-3 list-disc pl-5 leading-relaxed">
                {challenge.acceptanceCriteria.map((criterio, index) => (
                  <li key={index}>{criterio}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No se especificaron criterios de aceptación particulares.</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Sidebar de Acción */}
        <div>
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4">Estado de la Tarea</h3>
            
            <div className="flex justify-between items-center mb-5 text-sm">
              <span className="text-bh-muted">Disponibilidad:</span>
              <span className="text-emerald-400 font-bold">Disponible</span>
            </div>

            <div className="flex justify-between mb-6 text-sm">
              <span className="text-bh-muted">Tiempo Límite:</span>
              <div className="text-right">
                <span className="font-bold block text-white">6 Horas</span>
                <span className="text-xs text-bh-muted">(El tiempo para enviar tu solución)</span>
                <div className="mt-2 text-xs text-bh-yellow leading-tight">
                  Expira a las {expirationTime} hrs del {expirationDate}.<br/>
                  ¡No te la pierdas! ¡Tómala!
                </div>
              </div>
            </div>

            <hr className="border-t border-bh-border mb-6" />

            {/* LÓGICA DE BOTONES Y SESIÓN */}
            {!session?.user ? (
              <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-300">Debes iniciar sesión para tomar este desafío.</p>
              </div>
            ) : !session.user.isGitHubLinked ? (
              <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-300">Vincula tu GitHub en la barra superior para continuar.</p>
              </div>
            ) : hasActiveTask ? (
              <div className="text-center p-4 bg-bh-secondary border border-bh-border rounded-xl">
                <p className="text-xs text-bh-muted mb-3">Ya tienes un desafío en desarrollo (1/1 límite).</p>
                <Link href="/mis-tareas" className="block w-full bg-transparent border border-bh-yellow text-bh-yellow font-bold py-2.5 rounded-lg text-sm hover:bg-bh-yellow/10 transition">
                  Ir a mis tareas
                </Link>
              </div>
            ) : (
              <form action={takeChallengeWithId}>
                <button className="w-full flex items-center justify-center gap-2 bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.3)] hover:shadow-[0_0_25px_rgba(245,166,35,0.5)] mb-3">
                  Tomar este Desafío ➔
                </button>
              </form>
            )}

            <p className="text-[11px] text-bh-muted text-center mt-2 leading-relaxed">
              Al tomarlo se te asignará una rama específica en el repositorio para que comiences a trabajar.
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}