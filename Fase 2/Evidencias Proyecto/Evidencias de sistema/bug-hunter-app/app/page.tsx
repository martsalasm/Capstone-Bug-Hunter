import { prisma } from "@/lib/prisma";
import { ChallengeCard } from "@/components/challenge-card";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  
  // Traemos los últimos 6 desafíos publicados
  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

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
            <Link href="#proyectos" className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold px-6 py-3 rounded-lg transition text-center">
              Explorar Proyectos ➔
            </Link>
            <Link href="#como-funciona" className="bg-bh-secondary border border-bh-border hover:bg-bh-border text-white font-semibold px-6 py-3 rounded-lg transition text-center">
              Saber Más
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-bh-card border border-bh-border rounded-2xl p-8 md:p-12 text-center">
        <div className="space-y-2">
          <h3 className="text-4xl font-extrabold text-white">2,400+</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Tareas Completadas</p>
        </div>
        <div className="space-y-2 md:border-x md:border-bh-border">
          <h3 className="text-4xl font-extrabold text-white">50+</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Proyectos Activos Ahora</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-extrabold text-white">100+</h3>
          <p className="text-xs font-bold text-bh-muted tracking-widest uppercase">Bug Hunters Activos</p>
        </div>
      </section>

      {/* LIVE TASKS SECTION */}
      <section id="proyectos">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-bh-border pb-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Últimos Trabajos Publicados
          </h2>
          <Link href="#proyectos" className="text-sm font-semibold text-bh-yellow hover:text-bh-yellow-hover transition">
            Ver Todos los Proyectos ➔
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-20 bg-bh-card border border-bh-border rounded-xl">
            <p className="text-bh-muted">Aún no hay desafíos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                id={challenge.id}
                title={challenge.title}
                description={challenge.description}
                difficulty={challenge.difficulty}
                techStack={challenge.techStack}
              />
            ))}
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
          {/* Card 1 */}
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">01</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">🪲</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Explora Tareas</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Encuentra tareas que coincidan con tus tecnologías preferidas y tu nivel de experiencia.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">02</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">💻</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Trabaja y envía tu PR</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Una vez escojas y realices tu tarea, súbela a tu rama y envía tu Pull Request.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-bh-card border border-bh-border rounded-2xl p-6 relative overflow-hidden group hover:border-bh-yellow/50 transition">
            <span className="absolute top-4 right-6 text-5xl font-black text-bh-primary/50 group-hover:text-bh-primary transition">03</span>
            <div className="w-12 h-12 bg-bh-primary border border-bh-border rounded-xl flex items-center justify-center text-xl mb-6 relative z-10">✅</div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10">Espera la aceptación</h3>
            <p className="text-sm text-bh-muted leading-relaxed relative z-10">Una vez aceptado tu PR ya participaste de un proyecto y ganaste experiencia.</p>
          </div>

          {/* Card 4 */}
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