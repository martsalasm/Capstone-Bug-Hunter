import 'dotenv/config'
import { PrismaClient, Role, Difficulty, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos previos
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
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
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

  // === NUEVO DESAFÍO PARA DEMO EN VIVO ===
  const challengeDemo = await prisma.challenge.create({
    data: {
      title: 'Sincronización de Webhooks con Smee.io',
      description: 'Configurar y validar la recepción de eventos de GitHub mediante Smee.io. Este desafío está diseñado para probar la integración en tiempo real del sistema BugHunter.',
      acceptanceCriteria: [
        'Realizar un fork del repositorio de prueba.',
        'Crear una nueva rama con el formato asignado.',
        'Realizar un commit de prueba y enviar un Pull Request.',
        'El sistema debe detectar el Pull Request y actualizar el estado automáticamente.'
      ],
      difficulty: Difficulty.FACIL,
      techStack: ['GitHub Webhooks', 'Smee.io', 'Integración'],
      timeLimitHours: 2, // Tiempo corto para dar sensación de urgencia en la demo
      repoUrl: 'https://github.com/martsalasm/test-smee', // Tu repo de prueba
      creatorId: docente.id, 
    },
  })

  // 5. Crear Asignaciones
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

  const expiresAtCompleted = new Date()
  expiresAtCompleted.setDate(expiresAtCompleted.getDate() - 1) 

  const tareaCompletada = await prisma.taskAssignment.create({
    data: {
      userId: estudiante.id,
      challengeId: challengeMedio.id,
      branchName: 'bh-dev-2002',
      status: TaskStatus.COMPLETADO,
      expiresAt: expiresAtCompleted,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
    },
  })

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

  const expiresAtExpired = new Date()
  expiresAtExpired.setDate(expiresAtExpired.getDate() - 5) 

  await prisma.taskAssignment.create({
    data: {
      userId: estudiante.id,
      challengeId: challengeDificil.id,
      branchName: 'bh-dev-3003',
      status: TaskStatus.EXPIRADO,
      expiresAt: expiresAtExpired,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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