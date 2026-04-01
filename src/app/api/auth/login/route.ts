import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Usuario no encontrado o contrase\u00f1a no establecida" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // [SUPER ADMIN OVERRIDE] Ensure Patricio Diaz is always PRO
    if (email.toLowerCase().trim() === 'pdiazg46@gmail.com' && !user.isPro) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isPro: true }
      });
      user.isPro = true;
    }

    const token = await new SignJWT({ id: user.id, email: user.email, isPro: user.isPro })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key'));

    const res = NextResponse.json({ message: "Login exitoso", user: { id: user.id, email: user.email, isPro: user.isPro } });
    
    // Cookie HTTPOnly - Lax for iOS PWA stability
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return res;

  } catch (error) {
    console.error("Error al inciar sesión:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
