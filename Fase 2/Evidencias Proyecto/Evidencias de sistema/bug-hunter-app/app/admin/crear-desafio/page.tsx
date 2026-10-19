import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createChallenge } from "@/app/actions/challenge"

export default async function CreateChallengePage() {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CREATOR")) {
    redirect("/")
  }

  // Calcular fecha por defecto: 1 semana (7 días) a partir de hoy
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 7)
  defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset())
  const defaultExpiresAt = defaultDate.toISOString().slice(0, 16)

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/admin/mis-desafios" className="text-sm text-bh-muted hover:text-white transition">
          ← Volver a Mis Desafíos
        </Link>
        <h1 className="text-3xl font-extrabold text-white mt-2">Publicar Nuevo Desafío</h1>
        <p className="text-bh-muted text-sm mt-1">
          Crea un encargo práctico y define las reglas de tiempo para los estudiantes.
        </p>
      </div>

      <form action={createChallenge} className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Título */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Título del Desafío</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="Ej: Corrección de Bug en API REST Node.js"
            className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Descripción / Instrucciones</label>
          <textarea 
            name="description" 
            required 
            rows={4}
            placeholder="Detalla qué fallas debe corregir el alumno y los requerimientos de la entrega..."
            className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition"
          />
        </div>

        {/* Criterios de Aceptación */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
            Criterios de Aceptación
          </label>
          <p className="text-[11px] text-bh-muted mb-2">Escribe cada criterio separado por una coma o en una nueva línea.</p>
          <textarea 
            name="acceptanceCriteria" 
            required 
            rows={3}
            placeholder={`El componente debe usar Tailwind CSS\nDebe verse correctamente en dispositivos móviles\nIncluir manejo de errores en llamadas a la API`}
            className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition font-mono"
          />
        </div>

        {/* URL Repositorio GitHub */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-2">URL del Repositorio Plantilla (GitHub)</label>
          <input 
            type="url" 
            name="repoUrl" 
            required 
            placeholder="https://github.com/duoc-profesor/desafio-node-bug"
            className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition"
          />
        </div>

        {/* Dificultad y Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Dificultad</label>
            <select 
              name="difficulty" 
              defaultValue="FACIL"
              className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition cursor-pointer"
            >
              <option value="FACIL">FÁCIL</option>
              <option value="MEDIO">MEDIO</option>
              <option value="DIFICIL">DÍFICIL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Tecnologías (separadas por coma)</label>
            <input 
              type="text" 
              name="techStack" 
              required 
              placeholder="Next.js, TypeScript, Prisma"
              className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition"
            />
          </div>
        </div>

        {/* SECCIÓN CONFIGURACIÓN DE TIEMPOS */}
        <div className="border-t border-bh-border pt-6 mt-6 space-y-4">
          <h3 className="text-sm font-bold text-bh-yellow uppercase tracking-wider">⏱️ Control de Tiempos y Cierre</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Límite por Estudiante */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Límite por Estudiante
              </label>
              <p className="text-[11px] text-bh-muted mb-2">Horas que tendrá el alumno para completar la tarea una vez asignada.</p>
              <select 
                name="timeLimitHours" 
                defaultValue="6"
                className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition cursor-pointer"
              >
                <option value="2">2 Horas (Prueba rápida)</option>
                <option value="6">6 Horas (Estándar)</option>
                <option value="12">12 Horas</option>
                <option value="24">24 Horas (1 Día)</option>
                <option value="48">48 Horas (2 Días)</option>
                <option value="168">7 Días (1 Semana)</option>
              </select>
            </div>

            {/* Fecha Límite Global */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Cierre Global del Desafío (Opcional)
              </label>
              <p className="text-[11px] text-bh-muted mb-2">Fecha y hora máxima en la que el desafío estará disponible en el catálogo.</p>
              <input 
                type="datetime-local" 
                name="expiresAt" 
                defaultValue={defaultExpiresAt}
                required
                className="w-full bg-bh-secondary border border-bh-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bh-yellow transition"
              />
            </div>

          </div>
        </div>

        {/* Botón Guardar */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-sm py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          >
            Publicar Desafío
          </button>
        </div>

      </form>
    </main>
  )
}