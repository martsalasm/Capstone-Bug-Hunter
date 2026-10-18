import { prisma } from "@/lib/prisma"
import { ChallengeCard } from "@/components/challenge-card"
import Link from "next/link"
import { Difficulty } from "@prisma/client"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{
    difficulty?: string
    query?: string
  }>
}

export default async function DesafiosPage({ searchParams }: Props) {
  const { difficulty, query } = await searchParams

  // Filtro dinámico para Prisma
  const whereFilter: any = {}

  if (difficulty && difficulty !== "TODAS") {
    whereFilter.difficulty = difficulty as Difficulty
  }

  if (query) {
    whereFilter.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { techStack: { has: query } }
    ]
  }

  // Traer todos los desafíos filtrados
  const challenges = await prisma.challenge.findMany({
    where: whereFilter,
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      
      {/* NAVEGACIÓN Y ENCABEZADO */}
      <div>
        <Link href="/" className="text-sm text-bh-muted hover:text-white transition">
          ← Volver al Inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
          Catálogo de Desafíos
        </h1>
        <p className="text-bh-muted text-sm mt-1">
          Explora todas las tareas prácticas y proyectos publicados para los estudiantes de Duoc UC.
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <form method="GET" className="bg-bh-card border border-bh-border rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Input de Búsqueda */}
        <div className="w-full md:flex-1 relative">
          <input
            type="text"
            name="query"
            defaultValue={query ?? ""}
            placeholder="Buscar por título o tecnología (ej: React, Node, Python)..."
            className="w-full bg-bh-secondary border border-bh-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-bh-yellow transition"
          />
        </div>

        {/* Filtro por Dificultad */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-bh-muted font-bold uppercase whitespace-nowrap">Dificultad:</label>
          <select
            name="difficulty"
            defaultValue={difficulty ?? "TODAS"}
            className="bg-bh-secondary border border-bh-border text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-bh-yellow transition cursor-pointer w-full md:w-auto"
          >
            <option value="TODAS">Todas las dificultades</option>
            <option value="FACIL">FÁCIL</option>
            <option value="MEDIO">MEDIO</option>
            <option value="DIFICIL">DÍFICIL</option>
          </select>

          <button
            type="submit"
            className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Filtrar
          </button>
        </div>

      </form>

      {/* GRILLA DE DESAFÍOS */}
      <section>
        {challenges.length === 0 ? (
          <div className="text-center py-16 bg-bh-card border border-bh-border border-dashed rounded-2xl">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-white font-bold text-base mb-1">No se encontraron desafíos</h3>
            <p className="text-bh-muted text-xs">
              Prueba modificando el término de búsqueda o cambiando el filtro de dificultad.
            </p>
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

    </main>
  )
}