import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import DeleteChallengeButton from "@/components/deleteChallengeButton"

export const dynamic = "force-dynamic"

export default async function MyCreatedChallengesPage() {
  const session = await auth()

  // Protección de ruta: Solo Creadores o Administradores
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CREATOR")) {
    redirect("/")
  }

  // Consultar todos los desafíos creados por este usuario específico
  const challenges = await prisma.challenge.findMany({
    where: {
      creatorId: session.user.id
    },
    include: {
      assignments: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Cálculos de métricas globales del docente
  const totalPublished = challenges.length
  const totalActiveStudents = challenges.reduce((acc, ch) => {
    return acc + ch.assignments.filter(a => a.status === "EN_DESARROLLO").length
  }, 0)
  const totalPendingPRs = challenges.reduce((acc, ch) => {
    return acc + ch.assignments.filter(a => a.status === "PR_ENVIADO").length
  }, 0)

  const difficultyStyles = {
    FACIL: "bg-badge-facil-bg text-badge-facil-text border-badge-facil-text/20",
    MEDIO: "bg-badge-medio-bg text-badge-medio-text border-badge-medio-text/20",
    DIFICIL: "bg-badge-dificil-bg text-badge-dificil-text border-badge-dificil-text/20",
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-bh-border gap-4">
        <div>
          <Link href="/" className="text-sm text-bh-muted hover:text-white transition">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-extrabold text-white mt-2">Mis Desafíos Publicados</h1>
          <p className="text-bh-muted text-sm mt-1">
            Gestiona los proyectos que has creado para los estudiantes de la plataforma.
          </p>
        </div>
        <div>
          <Link 
            href="/admin/crear-desafio" 
            className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          >
            <span>+ Publicar Nuevo Desafío</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas del Docente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-bh-card border border-bh-border rounded-xl p-5">
          <p className="text-xs text-bh-muted font-bold uppercase tracking-wider mb-1">Publicados</p>
          <p className="text-3xl font-extrabold text-white">{totalPublished}</p>
        </div>
        <div className="bg-bh-card border border-bh-border rounded-xl p-5">
          <p className="text-xs text-bh-muted font-bold uppercase tracking-wider mb-1">Alumnos Desarrollando</p>
          <p className="text-3xl font-extrabold text-bh-yellow">{totalActiveStudents}</p>
        </div>
        <div className="bg-bh-card border border-bh-border rounded-xl p-5">
          <p className="text-xs text-bh-muted font-bold uppercase tracking-wider mb-1">PRs por Revisar</p>
          <p className="text-3xl font-extrabold text-purple-400">{totalPendingPRs}</p>
        </div>
      </div>

      {/* Lista de Desafíos */}
      <section>
        {challenges.length === 0 ? (
          <div className="bg-bh-card border border-bh-border border-dashed rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-white font-bold text-lg mb-2">Aún no has publicado ningún desafío</h3>
            <p className="text-bh-muted text-sm max-w-md mx-auto mb-6">
              Comienza creando tu primer encargo para que los estudiantes de Duoc puedan tomarlo.
            </p>
            <Link 
              href="/admin/crear-desafio" 
              className="inline-block bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-sm px-6 py-2.5 rounded-xl transition"
            >
              Crear Desafío
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const activeCount = challenge.assignments.filter(a => a.status === "EN_DESARROLLO").length
              const prCount = challenge.assignments.filter(a => a.status === "PR_ENVIADO").length
              const completedCount = challenge.assignments.filter(a => a.status === "COMPLETADO").length

              return (
                <div 
                  key={challenge.id} 
                  className="bg-bh-card border border-bh-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-bh-yellow/40 transition"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${difficultyStyles[challenge.difficulty]}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-xs text-bh-muted">
                        Publicado el {new Date(challenge.createdAt).toLocaleDateString("es-CL")}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-tight">
                      {challenge.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {challenge.techStack.map(tech => (
                        <span key={tech} className="bg-bh-secondary border border-bh-border text-bh-muted text-[11px] px-2.5 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Estadísticas específicas del desafío */}
                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-bh-border pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                      <span className="block text-xs text-bh-muted">En Progreso</span>
                      <span className="text-lg font-bold text-bh-yellow">{activeCount}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-bh-muted">PR Envíados</span>
                      <span className="text-lg font-bold text-purple-400">{prCount}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-bh-muted">Completados</span>
                      <span className="text-lg font-bold text-emerald-400">{completedCount}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row items-center gap-3 border-t md:border-t-0 border-bh-border pt-4 md:pt-0 md:pl-4">
                    <Link 
                      href={`/desafios/${challenge.id}`}
                      className="bg-bh-secondary border border-bh-border hover:bg-bh-border text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition text-center flex-1 md:flex-none"
                    >
                      Ver Vista Previa
                    </Link>
                    <DeleteChallengeButton challengeId={challenge.id} />
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </section>

    </main>
  )
}