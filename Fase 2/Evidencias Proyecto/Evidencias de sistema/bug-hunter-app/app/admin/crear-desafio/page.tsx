import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createChallenge } from "@/app/actions/challenge"
import Link from "next/link"

export default async function AdminCreateChallengePage() {
  const session = await auth()

  // PROTECCIÓN DE RUTA
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CREATOR")) {
    redirect("/")
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-bh-muted hover:text-white transition">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-extrabold text-white mt-4">Publicar Nuevo Desafío</h1>
        <p className="text-bh-muted mt-2">
          Agrega un nuevo proyecto al catálogo separando la descripción de los criterios exactos de evaluación.
        </p>
      </div>

      <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
        <form action={createChallenge} className="space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-white mb-2">Título del Encargo</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required
              placeholder="Ej: Crear componente de tarjeta de producto..."
              className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-bold text-white mb-2">Dificultad</label>
              <select 
                id="difficulty" 
                name="difficulty" 
                className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition appearance-none"
              >
                <option value="FACIL">Fácil</option>
                <option value="MEDIO">Medio</option>
                <option value="DIFICIL">Difícil</option>
              </select>
            </div>

            <div>
              <label htmlFor="techStack" className="block text-sm font-bold text-white mb-2">Tecnologías (separadas por coma)</label>
              <input 
                type="text" 
                id="techStack" 
                name="techStack" 
                required
                placeholder="Ej: React, Tailwind, Next.js"
                className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="repoUrl" className="block text-sm font-bold text-white mb-2">URL del Repositorio Base (GitHub)</label>
            <input 
              type="url" 
              id="repoUrl" 
              name="repoUrl" 
              required
              placeholder="https://github.com/DuocUC-BugHunter/tu-repo"
              className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-white mb-2">¿De qué trata el encargo?</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              required
              placeholder="Explica el contexto general del problema a resolver..."
              className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition resize-y"
            ></textarea>
          </div>

          <div>
            <label htmlFor="acceptanceCriteria" className="block text-sm font-bold text-white mb-2">Lo que se pide para aceptar la tarea (Criterios)</label>
            <p className="text-xs text-bh-muted mb-2">Escribe un criterio por línea (presiona Enter para separar).</p>
            <textarea 
              id="acceptanceCriteria" 
              name="acceptanceCriteria" 
              rows={5}
              required
              placeholder="Que la tarjeta sea responsiva.&#10;Usar Tailwind CSS.&#10;Que el botón cambie de color en hover."
              className="w-full bg-bh-secondary border border-bh-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bh-yellow transition resize-y"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-bh-border flex justify-end">
            <button 
              type="submit"
              className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold px-8 py-3 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.3)] hover:shadow-[0_0_25px_rgba(245,166,35,0.5)]"
            >
              Publicar Desafío
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}