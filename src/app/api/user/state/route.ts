import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { demoData: true }
    });

    return NextResponse.json({ demoData: user?.demoData || null });
  } catch (error) {
    console.error("Error obteniendo estado:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { demoData } = await req.json();

    await prisma.user.update({
      where: { id: payload.id as string },
      data: { demoData: typeof demoData === 'string' ? demoData : JSON.stringify(demoData) }
    });

    return NextResponse.json({ message: "Estado guardado en la nube" });
  } catch (error) {
    console.error("Error guardando estado:", error);
    return NextResponse.json({ error: "Fallo al guardar estado" }, { status: 500 });
  }
}
