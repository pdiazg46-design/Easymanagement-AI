import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
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

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
         id: true,
         email: true,
         name: true,
         country: true,
         clientUrl: true,
         logoUrl: true,
         avatarUrl: true,
         isPro: true
      }
    });

    if (!user) {
       return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Error validando sesión:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
