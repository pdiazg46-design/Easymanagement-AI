import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import webPush from 'web-push';
import bcrypt from 'bcryptjs';

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivate = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublic && vapidPrivate) {
  webPush.setVapidDetails(
    'mailto:soporte@easymanagement.app',
    vapidPublic,
    vapidPrivate
  );
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Falta el correo" }, { status: 400 });

    const userToReset = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!userToReset) return NextResponse.json({ error: "Correo no registrado" }, { status: 404 });

    const tempPassword = 'temporal' + Math.floor(1000 + Math.random() * 9000);
    const hash = await bcrypt.hash(tempPassword, 10);
    
    await prisma.user.update({
       where: { id: userToReset.id },
       data: { password: hash }
    });

    // Find all Pro users (SuperAdmins) to notify
    const superAdmins = await prisma.user.findMany({
      where: { isPro: true },
      include: { subscriptions: true } as any
    });

    let sentCount = 0;

    for (const admin of superAdmins) {
      const subs = (admin as any).subscriptions || [];
      for (const sub of subs) {
        try {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          };
          const payload = JSON.stringify({
            title: 'Recuperación de Acceso 🔑',
            body: `El usuario ${userToReset.name} (${userToReset.email}) ha solicitado restablecer su contraseña. Atiéndelo en el panel de administrador.`
          });

          await webPush.sendNotification(pushConfig, payload);
          sentCount++;
        } catch (e: any) {
           if (e.statusCode === 410 || e.statusCode === 404) {
              await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
           } else {
              console.error('Error al enviar push notification:', e);
           }
        }
      }
    }

    return NextResponse.json({ success: true, message: `⚠️ Clave restaurada a: ${tempPassword}` });

  } catch (error) {
    console.error("Error pidiendo reseteo:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
