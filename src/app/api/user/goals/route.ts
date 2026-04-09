import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

async function getSessionUser(req: Request) {
  const authHeader = req.headers.get('cookie');
  const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
  try {
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { tenant: true }
    });
    return user;
  } catch {
    return null;
  }
}

// GET - Obtener metas del Tenant
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Si no tiene tenant, devolvemos defaults
    if (!user.tenant) {
      return NextResponse.json({ monthlyGoalUsd: 80000, annualGoalUsd: 1000000 });
    }

    return NextResponse.json({
      monthlyGoalUsd: user.tenant.monthlyGoalUsd ?? 80000,
      annualGoalUsd: user.tenant.annualGoalUsd ?? 1000000,
    });
  } catch (error) {
    console.error('Error obteniendo metas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT - Actualizar metas del Tenant
export async function PUT(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { monthlyGoalUsd, annualGoalUsd } = body;

    const dataToUpdate: any = {};
    if (monthlyGoalUsd !== undefined) dataToUpdate.monthlyGoalUsd = Number(monthlyGoalUsd);
    if (annualGoalUsd !== undefined) dataToUpdate.annualGoalUsd = Number(annualGoalUsd);

    // Upsert: actualizar o crear tenant
    if (user.tenantId) {
      await prisma.tenant.update({
        where: { id: user.tenantId },
        data: dataToUpdate
      });
    } else {
      const newTenant = await prisma.tenant.create({
        data: { name: 'Mi Empresa', ...dataToUpdate }
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: newTenant.id }
      });
    }

    return NextResponse.json({ success: true, ...dataToUpdate });
  } catch (error) {
    console.error('Error actualizando metas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
