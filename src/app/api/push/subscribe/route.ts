import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const subscription = await req.json();

    // Guardar la suscripción atada al ID del usuario
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: payload.id as string
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: payload.id as string
      }
    });

    return NextResponse.json({ success: true, message: "Suscripción a notificaciones exitosa" });
  } catch (error) {
    console.error("Error al suscribirse:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
