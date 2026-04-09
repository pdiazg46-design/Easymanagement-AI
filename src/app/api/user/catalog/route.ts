import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

async function getAuthUser(req: Request) {
  const authHeader = req.headers.get('cookie');
  const tokenMatch = authHeader?.match(/auth-token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const payload = await getAuthUser(req);
    if (!payload?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const items = await prisma.catalogItem.findMany({
      where: { userId: payload.id as string }
    });

    return NextResponse.json({ items });

  } catch (error) {
    console.error("Error obteniendo catálogo:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getAuthUser(req);
    if (!payload?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { items } = body; // Array de { name, price, stock }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const userId = payload.id as string;

    // Reemplazo atómico: Borrar anteriores e insertar nuevos para el USUARIO
    await prisma.$transaction([
      prisma.catalogItem.deleteMany({ where: { userId } }),
      prisma.catalogItem.createMany({
        data: items.map((item: any) => ({
          name: item.name,
          price: item.price,
          stock: item.stock || "Disponible",
          userId: userId
        }))
      })
    ]);

    return NextResponse.json({ message: "Catálogo actualizado correctamente", count: items.length });

  } catch (error) {
    console.error("Error guardando catálogo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
