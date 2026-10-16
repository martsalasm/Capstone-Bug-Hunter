import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isCreatorOrAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "CREATOR";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bh-border bg-bh-primary/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight group">
          <div className="w-8 h-8 rounded-lg bg-bh-card border border-bh-border flex items-center justify-center text-base group-hover:border-bh-yellow transition">
            🪲
          </div>
          <span>Bug<span className="text-bh-yellow">Hunter</span></span>
        </Link>

        {/* Links de Navegación */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-white hover:text-bh-yellow transition">
            Proyectos Disponibles
          </Link>
          <Link href="/mis-tareas" className="text-bh-muted hover:text-white transition">
            Mis Tareas
          </Link>

          {/* Links para Creadores / Administradores */}
          {isCreatorOrAdmin && (
            <Link href="/admin/crear-desafio" className="text-bh-yellow hover:underline transition font-semibold">
              + Publicar Desafío
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/usuarios" className="text-purple-400 hover:text-purple-300 transition font-semibold">
              Gestión Usuarios
            </Link>
          )}
        </nav>

        {/* Zona de Autenticación */}
        <div className="flex items-center gap-3">
          {!session?.user ? (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="bg-bh-yellow hover:bg-bh-yellow-hover text-black font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                Ingresar (Duoc UC)
              </button>
            </form>
          ) : !session.user.isGitHubLinked ? (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Vincular GitHub
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "Avatar"}
                    className="w-8 h-8 rounded-full border border-bh-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bh-yellow text-black flex items-center justify-center font-bold text-xs">
                    {session.user.name?.charAt(0) ?? "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-bh-muted">
                  {session.user.name?.split(" ")[0]}
                </span>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="text-bh-muted hover:text-red-400 text-xs px-2 py-1 rounded transition"
                >
                  Salir
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}