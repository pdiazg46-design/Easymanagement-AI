"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Helper para crear un Tenant y User inicial silo no existen (Mock Auth para Fase 2 Temprana)
async function getOrCreateMockSession() {
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "My Corporation",
        annualGoalUsd: 1000000,
        monthlyGoalUsd: 80000
      }
    });
  }

  let user = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@easymanagement.app",
        name: "Super Ejecutivo",
        tenantId: tenant.id
      }
    });
  }

  return { tenant, user };
}

// OBTENER ACTIVIDADES
export async function getActivities() {
  const { user } = await getOrCreateMockSession();
  
  const activities = await prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  return activities;
}

// CREAR ACTIVIDAD
export async function createActivity(data: { extractedAction: string, commitmentDateStr?: string, rawAudioText?: string }) {
  const { user } = await getOrCreateMockSession();
  
  // Parse YYYY-MM-DD to DateTime if possible
  let commitmentDate: Date | null = null;
  if (data.commitmentDateStr) {
     const [year, month, day] = data.commitmentDateStr.split('-');
     if (year && month && day) {
        commitmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
     }
  }

  const activity = await prisma.activityLog.create({
    data: {
      userId: user.id,
      extractedAction: data.extractedAction,
      commitmentDate: commitmentDate,
      rawAudioText: data.rawAudioText
    }
  });

  revalidatePath("/");
  return activity;
}

// MARCAR COMO COMPLETADA
export async function toggleActivityCompletion(id: string, completed: boolean) {
  const { user } = await getOrCreateMockSession();
  
  const activity = await prisma.activityLog.update({
    where: { id, userId: user.id },
    data: { completed }
  });

  revalidatePath("/");
  return activity;
}

// ELIMINAR ACTIVIDAD
export async function deleteActivity(id: string) {
  const { user } = await getOrCreateMockSession();
  
  await prisma.activityLog.delete({
    where: { id, userId: user.id }
  });

  revalidatePath("/");
  return true;
}
