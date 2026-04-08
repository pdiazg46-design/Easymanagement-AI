import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id) {
       return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await req.json();
    const { country, clientUrl, logoUrl, avatarUrl } = body;

    const dataToUpdate: any = {};
    if (country) dataToUpdate.country = country;
    if (clientUrl) dataToUpdate.clientUrl = clientUrl;
    if (logoUrl) dataToUpdate.logoUrl = logoUrl;
    if (avatarUrl) dataToUpdate.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: payload.id as string },
      data: dataToUpdate
    });

    const currentUser = await prisma.user.findUnique({ where: { id: payload.id as string } });

    // Aseguramos que el Logo del Mandante quede guardado de forma permanente a nivel Global en el Tenant vinculado
    if (logoUrl) {
       if (currentUser?.tenantId) {
          await prisma.tenant.update({
             where: { id: currentUser.tenantId },
             data: { logoUrl }
          });
       } else {
          let firstTenant = await prisma.tenant.findFirst();
          if (firstTenant) {
             await prisma.tenant.update({
                where: { id: firstTenant.id },
                data: { logoUrl }
             });
             await prisma.user.update({
                where: { id: payload.id as string },
                data: { tenantId: firstTenant.id }
             });
          } else {
             const newTenant = await prisma.tenant.create({
                data: { name: "Tenant Original", logoUrl }
             });
             await prisma.user.update({
                where: { id: payload.id as string },
                data: { tenantId: newTenant.id }
             });
          }
       }
    }

    return NextResponse.json({ message: "Perfil actualizado correctamente", user: updatedUser });

  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
