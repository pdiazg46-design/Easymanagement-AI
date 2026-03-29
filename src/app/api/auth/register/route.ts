import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

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
        password: hashedPassword,
        isPro: email === 'pdiazg46@gmail.com', // SUPER ADMIN OVERRIDE
      },
    });

    return NextResponse.json({ message: "Usuario creado exitosamente", user: { id: newUser.id, email: newUser.email, isPro: newUser.isPro } }, { status: 201 });

  } catch (error) {
    console.error("Error al registrar:", error);
    return NextResponse.json({ error: "Ocurrió un error en el servidor" }, { status: 500 });
  }
}
