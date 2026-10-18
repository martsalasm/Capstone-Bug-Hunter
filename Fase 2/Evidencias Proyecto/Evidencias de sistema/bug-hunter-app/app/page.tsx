import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  
  // Consultas dinámicas concurrentes a PostgreSQL
  const [challenges, completedTasksCount, activeChallengesCount, totalUsersCount] = await Promise.all([
    // Últimos 6 desafíos para la grilla (AÑADIMOS ASSIGNMENTS Y CREATOR PARA LA LÓGICA DE ESTADOS)
    prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        creator: { select: { name: true } },
        assignments: true
      }
    }),
    // Total de tareas completadas exitosamente
    prisma.taskAssignment.count({
      where: { status: "COMPLETADO" },
    }),
    // Total de proyectos/desafíos activos (sin expiración global o aún vigentes)
    prisma.challenge.count({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    }),
    // Total de Bug Hunters registrados en la plataforma
    prisma.user.count(),
  ]);

  const difficultyStyles = {
    FACIL: "bg-badge-facil-bg text-badge-facil-text border-badge-facil-text/20",
    MEDIO: "bg-badge-medio-bg text-badge-medio-text border-badge-medio-text/20",
    DIFICIL: "bg-badge-dificil-bg text-badge-dificil-text border-badge-dificil-text/20",
  }

  const now = new Date()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-24">
      
      {/* HERO SECTION */}
      <section className="text-center md:text-left flex flex-col md:flex-row items-center gap-12 mt-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Bienvenido al siguiente paso en tu <span className="text-bh-yellow">carrera estudiantil</span>
          </h1>
          <p className="text-lg text-bh-muted max-w-2xl leading-relaxed">
            Resuelve bugs reales y micro-tareas publicadas por docentes y alumnos de Duoc. Desarrolla tus habilidades y amplía tu portafolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Link href="/desafios" className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold px-6 py-3 rounded-lg transition text-center">
              Explorar Proyectos ➔
            </Link>
            <Link href="#como-funciona" className="bg-bh-secondary border border-bh-border hover:bg-bh-border text-white font-semibold px-6 py-3 rounded-lg transition text-center">
              Saber Más
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BANNER (DINÁMICO) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-bh-card border border-bh-border rounded-2xl p-8 md:p-12 text-center">
        <div className="space-y-2">
          <h3 className="text-4xl font-extrabold text-white">{completedTasksCount}</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Tareas Completadas</p>
        </div>
        <div className="space-y-2 md:border-x md:border-bh-border">
          <h3 className="text-4xl font-extrabold text-white">{activeChallengesCount}</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Proyectos Activos Ahora</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-extrabold text-white">{totalUsersCount}</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Bug Hunters Registrados</p>
        </div>
      </section>

      {/* LIVE TASKS SECTION */}
      <section id="proyectos">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-bh-border pb-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Últimos Trabajos Publicados
          </h2>
          <Link href="/desafios" className="text-sm font-semibold text-bh-yellow hover:text-bh-yellow-hover transition">
            Ver Todos los Proyectos ➔
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-20 bg-bh-card border border-bh-border rounded-xl">
            <p className="text-bh-muted">Aún no hay desafíos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                statusBadge = <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded">Tu Desafío</span>
              } else if (userActive) {
                statusBadge = <span className="bg-bh-yellow/20 text-bh-yellow text-[10px] px-2 py-0.5 rounded border border-bh-yellow/30 font-bold">🎯 Tu Tarea</span>
                borderStyle = "border-bh-yellow shadow-[0_0_15px_rgba(245,166,35,0.15)]"
              } else if (activeAssignment) {
                opacityStyle = "opacity-70 grayscale-[20%]"
                if (activeAssignment.status === "COMPLETADO") {
                  statusBadge = <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">✅ Resuelto</span>
                  borderStyle = "border-emerald-500/30"
                } else {
                  statusBadge = <span className="bg-gray-500/20 text-gray-300 text-[10px] px-2 py-0.5 rounded">🔒 Ocupado</span>
                  borderStyle = "border-gray-700"
                }
              } else if (isPermanentlyBlocked) {
                statusBadge = <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-500/30">❌ Bloqueado</span>
                borderStyle = "border-red-500/30"
                opacityStyle = "opacity-50 grayscale"
              } else if (isInCooldown) {
                statusBadge = <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded border border-orange-500/30 font-bold">⏳ En Descanso</span>
                borderStyle = "border-orange-500/40"
              } else {
                statusBadge = <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  {userFailedCount > 0 ? "🟢 Disponible (Reintento)" : "🟢 Disponible"}
                </span>
              }

              return (
                <div key={challenge.id} className={`bg-bh-card border rounded-2xl p-6 transition flex flex-col ${borderStyle} ${opacityStyle}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${difficultyStyles[challenge.difficulty]}`}>
                        {challenge.difficulty}
                      </span>
                      {statusBadge}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{challenge.title}</h3>
                  <p className="text-sm text-bh-muted line-clamp-3 mb-4 flex-1">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-bh-border pt-4 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {challenge.techStack.slice(0, 2).map(tech => (
                        <span key={tech} className="bg-bh-secondary text-bh-muted text-[10px] px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                      {challenge.techStack.length > 2 && (
                        <span className="text-bh-muted text-[10px] bg-bh-secondary px-2 py-1 rounded">+{challenge.techStack.length - 2}</span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/desafios/${challenge.id}`}
                      className="text-bh-yellow hover:text-bh-yellow-hover text-xs font-bold transition whitespace-nowrap"
                    >
                      Ver Detalles ➔
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* WORKFLOW SECTION */}
      <section id="como-funciona" className="pt-8">
        <div className="text-center mb-12">
          <span className="text-bh-yellow text-xs font-bold tracking-widest uppercase block mb-2">Nuestro flujo de trabajo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Sube de Nivel</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">01</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">🪲</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Explora Tareas</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Encuentra tareas que coincidan con tus tecnologías preferidas y tu nivel de experiencia.</p>
          </div>

          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">02</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">💻</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Trabaja y envía tu PR</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Una vez escojas y realices tu tarea, súbela a tu rama y envía tu Pull Request.</p>
          </div>

          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">03</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">✅</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Espera la aceptación</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Una vez aceptado tu PR ya participaste de un proyecto y ganaste experiencia.</p>
          </div>

          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">04</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">🚀</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">¡Continúa trabajando!</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">No te quedes sólo con uno, busca más proyectos y desarrolla tus habilidades.</p>
          </div>
        </div>
      </section>

      {/* CTA BOX */}
      {!session?.user && (
        <section className="bg-gradient-to-br from-bh-card to-bh-secondary border border-bh-border rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo Para Empezar?</h2>
          <p className="text-bh-muted text-lg mb-8 max-w-xl mx-auto">
            Inicia sesión con tu correo institucional y obtén tu primer proyecto hoy mismo.
          </p>
          <Link href="/api/auth/signin" className="inline-block bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold px-8 py-4 rounded-xl transition shadow-[0_0_20px_rgba(245,166,35,0.2)] hover:shadow-[0_0_30px_rgba(245,166,35,0.4)]">
            Iniciar Sesión y Comenzar
          </Link>
        </section>
      )}

    </main>
  );
}