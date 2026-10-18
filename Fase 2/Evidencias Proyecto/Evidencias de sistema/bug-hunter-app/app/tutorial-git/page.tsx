import Link from "next/link";

export const metadata = {
  title: "Tutorial de Git y GitHub desde Cero | BugHunter",
  description: "Guía completa para instalar Git, configurar SSH, entender GitHub, crear ramas y abrir Pull Requests.",
};

export default function GitTutorialPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      
      {/* NAVEGACIÓN Y ENCABEZADO */}
      <div>
        <Link href="/" className="text-sm text-bh-muted hover:text-white transition">
          ← Volver al Inicio
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-3">
          Tutorial de{" "}
          <a 
            href="https://git-scm.com/book/es/v2" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#F1502F] hover:text-[#ff6b4a] hover:underline decoration-[#F1502F]/40 underline-offset-4 transition-all duration-300"
            title="Leer el libro oficial Pro Git"
          >
            Git
          </a>
          {" "}y{" "}
          <a 
            href="https://docs.github.com/es/get-started" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#F1502F] hover:text-[#ff6b4a] hover:underline decoration-[#F1502F]/40 underline-offset-4 transition-all duration-300"
            title="Ir a las guías de inicio de GitHub"
          >
            GitHub
          </a>
        </h1>
        <p className="text-bh-muted text-base leading-relaxed max-w-2xl mb-6">
          Basado en el currículum de <a href="https://www.theodinproject.com/lessons/foundations-setting-up-git" target="_blank" rel="noreferrer" className="text-bh-yellow hover:underline">The Odin Project</a>, esta guía te llevará de la mano desde la instalación hasta entender las ramas, configurar SSH y abrir tu primer Pull Request.
        </p>

        {/* CHEATSHEET BANNER */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-amber-200">
            💡 ¿Ya sabes lo básico y solo buscas el <strong>cheatsheet</strong> (resumen rápido de comandos)?
          </p>
          <Link href="/cheatsheet-git" className="text-sm font-bold text-amber-400 hover:text-amber-300 transition whitespace-nowrap ml-4">
            Haz clic aquí ➔
          </Link>
        </div>
      </div>

      {/* FASE 1: PREPARACIÓN */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white border-b border-bh-border pb-2">Fase 1: Preparando el Entorno</h2>
        
        {/* Paso 1.1: Instalar Git */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>1.</span> Instalar Git
          </h3>
          <p className="text-bh-muted mb-4">
            Git es un programa de consola (terminal) y no viene instalado por defecto en la mayoría de los computadores.
          </p>
          <ul className="list-disc pl-5 text-bh-muted space-y-2 mb-4">
            <li><strong>Windows:</strong> Descarga el instalador desde <a href="https://git-scm.com/download/win" target="_blank" rel="noreferrer" className="text-bh-yellow hover:underline">la página oficial de Git</a> y dale "Siguiente" a todo dejando las opciones por defecto.</li>
            <li><strong>Mac:</strong> Abre tu terminal y escribe <code>git --version</code>. Si no lo tienes, el mismo sistema te pedirá instalar las "Command Line Tools".</li>
            <li><strong>Linux (Ubuntu/Debian):</strong> Abre la terminal y ejecuta <code>sudo apt install git</code>.</li>
          </ul>
        </div>

        {/* Paso 1.2: Cuenta de GitHub */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>2.</span> Tu cuenta de GitHub
          </h3>
          <p className="text-bh-muted mb-4">
            Si aún no tienes una, ve a <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-bh-yellow hover:underline">github.com</a> y regístrate. Te recomendamos usar tu correo institucional (@duocuc.cl) para mantener tu perfil académico.
          </p>
        </div>

        {/* Paso 1.3: Configurar Git */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>3.</span> Configurar Git por primera vez
          </h3>
          <p className="text-bh-muted mb-4">
            Ahora que instalaste Git, necesitas decirle quién eres para que firme tus commits. Abre tu terminal (en Windows busca "Git Bash", en Mac/Linux abre "Terminal") y ejecuta estos comandos con tus datos reales:
          </p>
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-5 font-mono text-sm space-y-3">
            <div>
              <span className="text-gray-500 block mb-1"># Configura tu nombre (el que aparecerá en tus commits)</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git config --global user.name "Tu Nombre Real"</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1"># Configura el mismo correo que usaste en GitHub</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git config --global user.email "tu@email.com"</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1"># Configura la rama principal por defecto como 'main'</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git config --global init.defaultBranch main</span>
            </div>
          </div>
        </div>
      </section>

      {/* FASE 2: GIT VS GITHUB */}
      <section className="bg-bh-card border border-bh-border rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Fase 2: ¿Git o GitHub? No son lo mismo</h2>
        <p className="text-bh-muted leading-relaxed mb-6 relative z-10">
          Es muy común confundirlos al principio. Para hacerlo simple:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-bh-secondary border border-bh-border p-6 rounded-xl">
            <h3 className="text-xl font-bold text-[#F1502F] mb-2 flex items-center gap-2">
              <span className="text-2xl">💻</span> Git
            </h3>
            <p className="text-sm text-bh-muted">
              Es el motor que corre <strong>localmente en tu computador</strong>. Su trabajo es rastrear los cambios en tus archivos, permitirte deshacer errores y guardar el historial de todo tu código mediante <em>commits</em>.
            </p>
          </div>
          <div className="bg-bh-secondary border border-bh-border p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-2xl">☁️</span> GitHub
            </h3>
            <p className="text-sm text-bh-muted">
              Es una plataforma <strong>en la nube</strong>. Piénsalo como un "Google Drive" diseñado específicamente para proyectos de Git. Permite que subas el historial de tu código para respaldarlo o colaborar con otras personas en equipo.
            </p>
          </div>
        </div>
      </section>

      {/* FASE 3: HTTPS VS SSH */}
      <section className="bg-bh-secondary border border-bh-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Fase 3: Conexión a GitHub (HTTPS vs SSH)</h2>
        <p className="text-bh-muted leading-relaxed mb-6">
          Para interactuar con repositorios en la nube (clonar o hacer push), GitHub necesita validar tu identidad. Tienes dos alternativas para hacerlo:
        </p>
        
        <div className="space-y-6">
          {/* HTTPS */}
          <div className="bg-bh-card border border-bh-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>🌐</span> Por HTTPS (Uso ocasional o laboratorios)
            </h3>
            <p className="text-sm text-bh-muted mb-2">
              Es muy útil si estás en un computador público (como los laboratorios del Duoc) donde no puedes guardar credenciales permanentes, o si solo quieres clonar un proyecto público para leerlo sin intención de hacer modificaciones.
            </p>
            <p className="text-sm text-bh-muted">
              El detalle es que si intentas hacer <code>push</code> por HTTPS, GitHub ya no acepta tu contraseña normal, sino que te pedirá generar un "Personal Access Token" (PAT) desde su web cada cierto tiempo, lo cual puede ser tedioso para el uso diario.
            </p>
          </div>

          {/* SSH */}
          <div className="bg-bh-card border border-bh-yellow/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-bh-yellow"></div>
            <h3 className="text-lg font-bold text-bh-yellow mb-2 flex items-center gap-2">
              <span>🔑</span> Por SSH (Nuestra recomendación y el estándar)
            </h3>
            <p className="text-sm text-bh-muted mb-3">
              En <strong>BugHunter</strong> te sugerimos configurar SSH para tu computador personal. Funciona generando un par de llaves criptográficas (una pública que dejas en GitHub y una privada secreta en tu PC). Las configuras una sola vez y <strong>nunca más te volverán a pedir contraseñas</strong>.
            </p>
            <p className="text-sm text-bh-muted mb-5">
              <strong className="text-amber-100">¿Por qué es el estándar de la industria profesional?</strong> Porque elimina la necesidad de transmitir credenciales a través de la red en cada acción, es criptográficamente resistente a ataques de fuerza bruta, y permite una autenticación automática y sin fricciones, algo fundamental cuando los equipos integran automatizaciones y servidores remotos (CI/CD).
            </p>
            
            <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-5 font-mono text-sm space-y-3 mb-5">
              <div>
                <span className="text-gray-500 block mb-1"># 1. En tu terminal, genera tu llave (presiona Enter a todo lo que te pida)</span>
                <span className="text-emerald-400">$</span> <span className="text-white">ssh-keygen -t ed25519 -C "tu@email.com"</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1"># 2. Muestra tu llave pública en la pantalla y cópiala completa</span>
                <span className="text-emerald-400">$</span> <span className="text-white">cat ~/.ssh/id_ed25519.pub</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1"># 3. Ve a GitHub → Settings → SSH and GPG keys → New SSH key, y pega la llave ahí.</span>
              </div>
            </div>

            <p className="text-sm text-bh-muted">
              Si quieres ver el proceso paso a paso con más detalle, revisa la <a href="https://docs.github.com/es/authentication/connecting-to-github-with-ssh" target="_blank" rel="noreferrer" className="text-bh-yellow hover:underline font-bold">documentación oficial de GitHub sobre SSH</a>.
            </p>
          </div>
        </div>
      </section>

      {/* FASE 4: CONCEPTOS LOCALES */}
      <section className="bg-bh-card border border-bh-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Fase 4: El ciclo de vida de un archivo</h2>
        <p className="text-bh-muted leading-relaxed mb-6">
          Para que un cambio en tu código quede guardado permanentemente en el historial, debe pasar por 3 estados:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-bh-secondary border border-bh-border p-5 rounded-xl text-center">
            <div className="text-3xl mb-2">📁</div>
            <h4 className="font-bold text-white mb-2">Working Directory</h4>
            <p className="text-xs text-bh-muted">Tus archivos tal como están en tu computador ahora mismo. Si los editas, Git nota que están modificados.</p>
          </div>
          <div className="bg-bh-secondary border border-bh-border p-5 rounded-xl text-center">
            <div className="text-3xl mb-2">📦</div>
            <h4 className="font-bold text-white mb-2">Staging Area</h4>
            <p className="text-xs text-bh-muted">La "caja" donde metes los archivos específicos que ya están listos para ser guardados juntos.</p>
          </div>
          <div className="bg-bh-secondary border border-bh-border p-5 rounded-xl text-center">
            <div className="text-3xl mb-2">✅</div>
            <h4 className="font-bold text-white mb-2">Local Repository</h4>
            <p className="text-xs text-bh-muted">El historial oficial en tu PC. Al hacer <code>commit</code>, sellas la caja y queda en el registro para siempre.</p>
          </div>
        </div>
      </section>

      {/* FASE 5: RAMAS (BRANCHES) */}
      <section className="bg-bh-secondary border border-bh-yellow/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-bh-yellow"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Fase 5: Entendiendo las Ramas (Branches)</h2>
        <p className="text-bh-muted leading-relaxed mb-4">
          Imagina que el código de tu proyecto es un árbol. El tronco principal siempre se llama <strong><code>main</code></strong>. Si quieres arreglar un bug sin riesgo de romper el código que ya funciona en el tronco, debes crear una <strong>rama</strong>.
        </p>
        <p className="text-bh-muted leading-relaxed mb-6">
          Una rama es una copia paralela de tu código. Trabajas en ella, haces tus commits y, cuando todo está perfecto, la fusionas de vuelta al tronco principal. 
          En <strong>BugHunter</strong>, cada vez que tomas un desafío, se espera que trabajes en tu propia rama y nunca directamente en <code>main</code>.
        </p>

        <div className="space-y-4">
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-5 font-mono text-sm space-y-3">
            <div>
              <span className="text-gray-500 block mb-1"># Ver en qué rama estás actualmente (la que tiene un * al lado)</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git branch</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1"># Crear una nueva rama y moverte hacia ella inmediatamente</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git checkout -b nombre-de-tu-rama</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1"># Moverte entre ramas ya existentes (sin la -b)</span>
              <span className="text-emerald-400">$</span> <span className="text-white">git checkout main</span>
            </div>
          </div>
        </div>
      </section>

      {/* FASE 6: COMANDOS ESENCIALES */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white border-b border-bh-border pb-2">Fase 6: Comandos de uso diario</h2>

        {/* Git Clone */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">git clone</h3>
          <p className="text-bh-muted mb-4">
            Descarga un repositorio que vive en GitHub directamente a tu computador. Asegúrate de copiar la URL en formato SSH.
          </p>
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-4 font-mono text-sm">
            <span className="text-emerald-400">$</span> <span className="text-white">git clone git@github.com:duoc-profesor/proyecto.git</span>
          </div>
        </div>

        {/* Git Status */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">git status</h3>
          <p className="text-bh-muted mb-4">
            Te dice exactamente qué está pasando: qué archivos has modificado, cuáles están listos en el Staging Area, y en qué rama te encuentras. <strong>Úsalo cada vez que tengas dudas.</strong>
          </p>
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-4 font-mono text-sm">
            <span className="text-emerald-400">$</span> <span className="text-white">git status</span>
          </div>
        </div>

        {/* Git Add */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">git add</h3>
          <p className="text-bh-muted mb-4">
            Mueve tus archivos modificados al <em>Staging Area</em>. Puedes añadir un archivo específico o añadir todos los cambios de golpe usando un punto <code>.</code>
          </p>
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-4 font-mono text-sm space-y-2">
            <div><span className="text-emerald-400">$</span> <span className="text-white">git add index.html</span> <span className="text-gray-500"># Añade solo index.html</span></div>
            <div><span className="text-emerald-400">$</span> <span className="text-white">git add .</span> <span className="text-gray-500 ml-7"># Añade todos los archivos modificados</span></div>
          </div>
        </div>

        {/* Git Commit */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">git commit</h3>
          <p className="text-bh-muted mb-4">
            Sella los cambios que preparaste con <code>git add</code> y los guarda en tu historial local. Siempre debe ir acompañado del flag <code>-m</code> y un mensaje descriptivo entre comillas.
          </p>
          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-4 font-mono text-sm">
            <span className="text-emerald-400">$</span> <span className="text-white">git commit -m "feat: agrega botón de login en el navbar"</span>
          </div>
        </div>

        {/* Git Push & Pull */}
        <div className="bg-bh-card border border-bh-border rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">git push</h3>
            <p className="text-sm text-bh-muted mb-4">
              Sube los commits de tu computador hacia GitHub. Debes indicarle a qué rama en la nube (origin) quieres enviarlos.
            </p>
            <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-3 font-mono text-xs space-y-2">
              <div><span className="text-gray-500"># Subir al tronco principal:</span></div>
              <div><span className="text-emerald-400">$</span> <span className="text-white">git push origin main</span></div>
              <div className="pt-2"><span className="text-gray-500"># Subir a tu rama específica:</span></div>
              <div><span className="text-emerald-400">$</span> <span className="text-white">git push origin mi-rama</span></div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">git pull</h3>
            <p className="text-sm text-bh-muted mb-4">
              Descarga los cambios más recientes que existan en GitHub y actualiza tu código local en la rama donde estés posicionado.
            </p>
            <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-3 font-mono text-xs">
              <span className="text-emerald-400">$</span> <span className="text-white">git pull origin main</span>
            </div>
          </div>
        </div>
      </section>

      {/* FASE 7: EL FLUJO BUG HUNTER */}
      <section className="bg-gradient-to-br from-[#151D2C] to-bh-primary border border-bh-yellow/30 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bh-yellow to-amber-600"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Fase 7: El Flujo Exacto en BugHunter 🪲</h2>
        <p className="text-bh-muted leading-relaxed mb-6">
          Cuando tomas un desafío, el sistema te asigna un nombre de rama específico (ej: <code>bh-dev-123456</code>). Tu trabajo es descargar el código del docente mediante SSH, moverte a esa rama, resolver el problema y subir tus cambios.
        </p>

        <div className="space-y-5 font-mono text-sm bg-[#0D1117] rounded-xl p-6 md:p-8 border border-gray-800 shadow-inner">
          <div>
             <p className="text-gray-500 text-xs mb-1">1. Clona el repositorio del desafío usando SSH</p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git clone git@github.com:duoc-profesor/proyecto.git</span></p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">cd proyecto</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">2. Crea la rama que te asignó la plataforma y muévete a ella</p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git checkout -b bh-dev-123456</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">3. ¡Abre tu editor, escribe el código y verifica!</p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git status</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">4. Añade y haz commit de tus soluciones</p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git add .</span></p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git commit -m "fix: formulario de login reparado"</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">5. Sube tu rama a GitHub</p>
            <p><span className="text-emerald-400">$</span> <span className="text-white">git push origin bh-dev-123456</span></p>
          </div>
        </div>
      </section>

      {/* FASE 8: PULL REQUESTS */}
      <section className="bg-bh-card border border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 relative z-10">Fase 8: El Pull Request (El paso final) 🚀</h2>
        <p className="text-bh-muted leading-relaxed mb-4 relative z-10">
          Ya hiciste el <code>git push</code> de tu rama hacia GitHub. ¿Terminaste? Casi. Tu código está en la nube, pero sigue aislado en tu propia rama. Para avisarle al dueño del proyecto que quieres integrar tu código al tronco principal, necesitas abrir un <strong>Pull Request (PR)</strong>.
        </p>
        <p className="text-bh-muted leading-relaxed mb-8 relative z-10">
          Un PR no es un comando de la terminal, es una función de la página web de GitHub. Es una solicitud formal que dice: <em>"Oye, ya terminé mi tarea en esta rama. Por favor revisa mi código y, si está todo bien, únelo (haz <strong>merge</strong>) a la rama principal (<code>main</code>)"</em>. Es el estándar absoluto en cualquier equipo de desarrollo.
        </p>

        <div className="bg-bh-secondary border border-bh-border rounded-2xl p-6 relative z-10">
          <h3 className="text-lg font-bold text-white mb-4">¿Cómo abrir el PR para tu tarea en BugHunter?</h3>
          <ol className="list-decimal pl-5 text-bh-muted space-y-3 mb-6">
            <li>Ve a la página del repositorio del desafío en <a href="https://github.com" target="_blank" rel="noreferrer" className="text-bh-yellow hover:underline">GitHub</a>.</li>
            <li>Verás un botón verde gigante (o un banner amarillo arriba) que dice <strong>"Compare & pull request"</strong> porque GitHub acaba de detectar tu nueva rama. Haz clic ahí.</li>
            <li>Ponle un título claro (ej: <code>Fix: Error de cálculo resuelto</code>) y en la descripción detalla brevemente qué líneas cambiaste.</li>
            <li>Haz clic en el botón verde inferior que dice <strong>"Create pull request"</strong>.</li>
          </ol>
          
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
            <strong className="block text-emerald-400 text-base mb-1">¡La Magia de BugHunter! ✨</strong>
            En el momento exacto en que haces clic en "Create pull request" en GitHub, nuestra plataforma lo detecta automáticamente de fondo y cambia el estado de tu tarea a <strong>EN REVISIÓN</strong>. ¡Si el docente o creador aprueba tu PR, ganarás tu estrella y subirás de rango!
          </div>
        </div>

        <div className="mt-8 text-center md:text-left relative z-10">
          <Link href="/desafios" className="inline-block bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold px-8 py-4 rounded-xl transition shadow-[0_0_15px_rgba(245,166,35,0.2)]">
            ¡Ya estás listo! Ve a tomar tu primer desafío ➔
          </Link>
        </div>
      </section>

    </main>
  );
}