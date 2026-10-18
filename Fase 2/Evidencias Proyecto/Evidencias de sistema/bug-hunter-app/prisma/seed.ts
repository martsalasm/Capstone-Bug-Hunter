import 'dotenv/config'
import { PrismaClient, Role, Difficulty, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos previos (el orden importa por las llaves foráneas, aunque Cascade ayuda)
  await prisma.auditLog.deleteMany()
  await prisma.taskAssignment.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.user.deleteMany()
  
  // 1. Crear Administrador
  const admin = await prisma.user.create({
    data: {
      name: 'Admin BugHunter',
      email: 'admin@duocuc.cl',
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })

  // 2. Crear Docente / Creador
  const docente = await prisma.user.create({
    data: {
      name: 'Profe Avaras',
      email: 'avaras@duocuc.cl',
      githubUsername: 'avaras-duoc',
      role: Role.CREATOR,
      emailVerified: new Date(),
    },
  })

  // 3. Crear Estudiante
  const estudiante = await prisma.user.create({
    data: {
      name: 'Martín Salas',
      email: 'm.salas@duocuc.cl',
      githubUsername: 'martinsalas',
      role: Role.STUDENT,
      emailVerified: new Date(),
      image: 'https://avatars.githubusercontent.com/u/1?v=4', // Imagen placeholder
    },
  })


  // 4. Crear Desafíos variados (Catálogo)
  const challengeFacil = await prisma.challenge.create({
    data: {
      title: 'Crear componente de tarjeta de producto para tienda de ropa',
      description: 'Construir un componente visual en React con Tailwind CSS para una tienda de ropa estudiantil. Debe ser adaptable a móviles (responsive).',
      acceptanceCriteria: [
        'El componente debe usar Tailwind CSS para los estilos.',
        'Debe verse correctamente en pantallas móviles y de escritorio.',
        'Debe incluir botón de "Añadir al carrito" con efecto hover.'
      ],
      difficulty: Difficulty.FACIL,
      techStack: ['React', 'Tailwind CSS', 'Frontend'],
      timeLimitHours: 6,
      repoUrl: 'https://github.com/duoc-profesor/tienda-ropa-ui',
      creatorId: docente.id,
    },
  })

  const challengeMedio = await prisma.challenge.create({
    data: {
      title: 'API REST para Inventario',
      description: 'Desarrollar los endpoints básicos (CRUD) para un sistema de gestión de inventario de laboratorio utilizando Node.js y Express.',
      acceptanceCriteria: [
        'Implementar endpoints GET, POST, PUT y DELETE.',
        'Validar los datos de entrada antes de guardar.',
        'Manejar errores 404 y 500 adecuadamente.'
      ],
      difficulty: Difficulty.MEDIO,
      techStack: ['Node.js', 'Express', 'Backend'],
      timeLimitHours: 12,
      repoUrl: 'https://github.com/duoc-profesor/inventario-api',
      creatorId: docente.id,
    },
  })

  const challengeDificil = await prisma.challenge.create({
    data: {
      title: 'Panel de Control (Dashboard) con SSR',
      description: 'Crear un dashboard de analíticas utilizando Next.js App Router y TypeScript. Debe consumir una API simulada y mostrar gráficos.',
      acceptanceCriteria: [
        'Uso estricto de TypeScript (sin any).',
        'Los datos iniciales deben cargar usando Server-Side Rendering (SSR).',
        'Implementar al menos un gráfico interactivo.'
      ],
      difficulty: Difficulty.DIFICIL,
      techStack: ['Next.js', 'TypeScript', 'Fullstack'],
      timeLimitHours: 48,
      repoUrl: 'https://github.com/duoc-profesor/dashboard-analytics',
      creatorId: docente.id,
    },
  })


  // 5. Crear Asignaciones con distintos estados para probar la UI
  
  // Tarea 1: EN DESARROLLO (Vence en 6 horas)
  const expiresAtActive = new Date()
  expiresAtActive.setHours(expiresAtActive.getHours() + challengeFacil.timeLimitHours)

  await prisma.taskAssignment.create({
    data: {
      userId: estudiante.id,
      challengeId: challengeFacil.id,
      branchName: 'bh-dev-1001',
      status: TaskStatus.EN_DESARROLLO,
      expiresAt: expiresAtActive,
    },
  })

  // Tarea 2: COMPLETADO (Para sumar estrellas en el perfil)
  const expiresAtCompleted = new Date()
  expiresAtCompleted.setDate(expiresAtCompleted.getDate() - 1) // Vencía ayer

  const tareaCompletada = await prisma.taskAssignment.create({
    data: {
      userId: estudiante.id,
      challengeId: challengeMedio.id,
      branchName: 'bh-dev-2002',
      status: TaskStatus.COMPLETADO,
      expiresAt: expiresAtCompleted,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Creada hace 2 días
    },
  })

  // Simular el webhook de GitHub que completó la tarea
  await prisma.auditLog.create({
    data: {
      assignmentId: tareaCompletada.id,
      eventPayload: {
        action: "closed",
        pull_request: {
          merged: true,
          head: { ref: "bh-dev-2002" },
          url: "https://github.com/duoc-profesor/inventario-api/pull/1"
        }
      },
    }
  })

  // Tarea 3: EXPIRADO (Para probar el historial negativo)
  const expiresAtExpired = new Date()
  expiresAtExpired.setDate(expiresAtExpired.getDate() - 5) // Venció hace 5 días

  await prisma.taskAssignment.create({
    data: {
      userId: estudiante.id,
      challengeId: challengeDificil.id,
      branchName: 'bh-dev-3003',
      status: TaskStatus.EXPIRADO,
      expiresAt: expiresAtExpired,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Creada hace 7 días
    },
  })
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })