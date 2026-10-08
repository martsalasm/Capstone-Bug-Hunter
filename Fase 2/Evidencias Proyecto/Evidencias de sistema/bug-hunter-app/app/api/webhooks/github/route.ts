import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Obtener el cuerpo de la petición en texto plano (necesario para verificar la firma)
    const rawBody = await req.text();
    
    // 2. Obtener los Headers que envía GitHub
    const signature = req.headers.get("x-hub-signature-256");
    const eventName = req.headers.get("x-github-event");
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    // Validaciones de seguridad
    if (!secret) return NextResponse.json({ error: "Falta configurar GITHUB_WEBHOOK_SECRET" }, { status: 500 });
    if (!signature) return NextResponse.json({ error: "Firma no proporcionada" }, { status: 401 });

    // 3. Verificar la firma criptográfica (HMAC SHA-256)
    // Esto asegura que la petición fue enviada 100% por GitHub y no fue alterada
    const hmac = crypto.createHmac("sha256", secret);
    const expectedSignature = "sha256=" + hmac.update(rawBody).digest("hex");

    // Previene ataques de timing usando timingSafeEqual
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn("[Webhook] Intento de acceso con firma inválida.");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    // 4. Procesar el evento de Pull Request
    if (eventName === "pull_request") {
      const payload = JSON.parse(rawBody);
      const action = payload.action; // Puede ser "opened", "closed", "synchronize", etc.
      
      // La rama de origen (donde el alumno hizo el trabajo)
      const branchName = payload.pull_request.head.ref;

      console.log(`[Webhook] Evento de Pull Request recibido. Acción: ${action}, Rama: ${branchName}`);

      // Solo nos interesa cuando abren el PR o cuando lo cierran (merge)
      if (action === "opened" || action === "closed") {
        
        // Buscamos si existe una tarea activa con ese nombre de rama
        const task = await prisma.taskAssignment.findFirst({
          where: { 
            branchName: branchName,
            // Podríamos aceptar tareas ya marcadas como PR_ENVIADO si queremos actualizarlas
            status: { in: ["EN_DESARROLLO", "PR_ENVIADO"] } 
          }
        });

        if (task) {
          // Lógica de estados: 
          // Si el PR fue cerrado y "merged" es true, lo marcamos COMPLETADO.
          // Si solo fue abierto, lo marcamos como PR_ENVIADO.
          let newStatus = task.status;
          
          if (action === "closed" && payload.pull_request.merged) {
            newStatus = "COMPLETADO";
          } else if (action === "opened") {
            newStatus = "PR_ENVIADO";
          }

          // Actualizamos la base de datos
          await prisma.taskAssignment.update({
            where: { id: task.id },
            data: { status: newStatus as any }
          });

          // Guardamos un registro de auditoría con la data de GitHub para que el docente pueda revisarlo
          await prisma.auditLog.create({
            data: {
              assignmentId: task.id,
              eventPayload: payload
            }
          });

          console.log(`[Webhook] Tarea ${task.id} actualizada a estado: ${newStatus}`);
        }
      }
    }

    // GitHub espera que le respondamos un código 200 rápido
    return NextResponse.json({ success: true, message: "Webhook procesado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}