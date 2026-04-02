import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  try {
    let { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }
    
    email = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Extract username as default name
        password: hashedPassword,
        isPro: email === 'pdiazg46@gmail.com', // SUPER ADMIN OVERRIDE
      },
    });

    const token = await new SignJWT({ id: newUser.id, email: newUser.email, isPro: newUser.isPro })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key'));

    const res = NextResponse.json({ message: "Usuario creado exitosamente", user: { id: newUser.id, email: newUser.email, isPro: newUser.isPro } }, { status: 201 });
    
    // Asignar JWT en Registro para ingreso inmediato
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return res;

  } catch (error: any) {
    console.error("Error al registrar:", error);
    return NextResponse.json({ error: "Ocurrió un error en el servidor", details: error.message }, { status: 500 });
  }
}
