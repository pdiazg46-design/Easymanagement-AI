import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

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

    const updatedUser = await prisma.user.update({
      where: { id: payload.id as string },
      data: {
         ...(country && { country }),
         ...(clientUrl !== undefined && { clientUrl }),
         ...(logoUrl !== undefined && { logoUrl }),
         ...(avatarUrl !== undefined && { avatarUrl })
      }
    });

    return NextResponse.json({ message: "Perfil actualizado correctamente", user: updatedUser });

  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
