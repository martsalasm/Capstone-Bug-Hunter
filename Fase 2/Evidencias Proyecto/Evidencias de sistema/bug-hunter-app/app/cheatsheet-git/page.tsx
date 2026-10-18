import Link from "next/link";

export const metadata = {
  title: "Git Cheatsheet | BugHunter",
  description: "Referencia rápida de comandos Git y el flujo de trabajo de BugHunter.",
};

export default function GitCheatsheetPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      
      {/* NAVEGACIÓN Y ENCABEZADO */}
      <div>
        <Link href="/tutorial-git" className="text-sm text-bh-muted hover:text-white transition">
          ← Volver al Tutorial Completo
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-3">
          Git <span className="text-[#F1502F]">Cheatsheet</span>
        </h1>
        <p className="text-bh-muted text-base leading-relaxed max-w-2xl">
          Tu referencia rápida de comandos. Guarda esta página en tus marcadores para cuando necesites recordar cómo hacer un commit, moverte de rama o subir tu código.
        </p>
      </div>

      {/* FLUJO BUG HUNTER (Limpio y directo) */}
      <section className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <span>🪲</span> El Flujo BugHunter
        </h2>
        <div className="bg-[#0D1117] border border-gray-800 rounded-xl p-5 md:p-6 font-mono text-sm space-y-5">
          <div>
            <span className="text-gray-500 block mb-1"># 1. Clona el repositorio del desafío</span>
            <span className="text-emerald-400">$</span> <span className="text-white">git clone git@github.com:duoc-profesor/proyecto.git</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1"># 2. Crea y muévete a tu rama asignada</span>
            <span className="text-emerald-400">$</span> <span className="text-white">git checkout -b bh-dev-123456</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1"># 3. Prepara y guarda tus cambios locales</span>
            <span className="text-emerald-400">$</span> <span className="text-white">git add .</span>
            <br />
            <span className="text-emerald-400">$</span> <span className="text-white">git commit -m "fix: bug resuelto"</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1"># 4. Sube tu rama a GitHub</span>
            <span className="text-emerald-400">$</span> <span className="text-white">git push origin bh-dev-123456</span>
          </div>
        </div>
      </section>

      {/* GRID DE COMANDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA: Trabajo Diario */}
        <section className="bg-bh-card border border-bh-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Trabajo Local (El día a día)</h2>
          <ul className="space-y-4">
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Ver el estado de tus archivos</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git status
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Añadir TODOS los cambios al staging</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git add .
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Añadir un archivo específico</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git add &lt;archivo&gt;
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Guardar cambios en el historial (Commit)</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git commit -m "tu mensaje aquí"
              </div>
            </li>
          </ul>
        </section>

        {/* TARJETA: Ramas (Branches) */}
        <section className="bg-bh-card border border-bh-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Ramas (Branches)</h2>
          <ul className="space-y-4">
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Ver lista de ramas locales</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git branch
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Crear una rama nueva y moverte a ella</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git checkout -b &lt;nombre-rama&gt;
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Moverte a una rama ya existente</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git checkout &lt;nombre-rama&gt;
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Eliminar una rama local</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git branch -d &lt;nombre-rama&gt;
              </div>
            </li>
          </ul>
        </section>

        {/* TARJETA: Sincronización Remota */}
        <section className="bg-bh-card border border-bh-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Nube (GitHub)</h2>
          <ul className="space-y-4">
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Clonar un repositorio por SSH</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300 truncate">
                git clone git@github.com:usuario/repo.git
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Subir tus commits a GitHub</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git push origin &lt;nombre-rama&gt;
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Descargar y actualizar cambios de GitHub</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-sm text-emerald-300">
                git pull origin &lt;nombre-rama&gt;
              </div>
            </li>
          </ul>
        </section>

        {/* TARJETA: Configuración y SSH */}
        <section className="bg-bh-card border border-bh-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Configuración Inicial & SSH</h2>
          <ul className="space-y-4">
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Configurar identidad local</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-xs text-emerald-300 space-y-1">
                <p>git config --global user.name "Nombre"</p>
                <p>git config --global user.email "email"</p>
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Generar llave SSH nueva</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-xs text-emerald-300">
                ssh-keygen -t ed25519 -C "tu@email.com"
              </div>
            </li>
            <li>
              <p className="text-sm text-bh-muted font-medium mb-1">Ver llave pública para pegarla en GitHub</p>
              <div className="bg-[#0D1117] border border-gray-800 p-3 rounded-lg font-mono text-xs text-emerald-300">
                cat ~/.ssh/id_ed25519.pub
              </div>
            </li>
          </ul>
        </section>

      </div>
    </main>
  );
}