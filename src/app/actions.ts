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
export async function createActivity(data: { extractedAction: string, commitmentDateStr?: string, rawAudioText?: string, clientId?: string, opportunityId?: string }) {
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
      rawAudioText: data.rawAudioText,
      clientId: data.clientId,
      opportunityId: data.opportunityId
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

// ============================================
// MODULO BASE DE CLIENTES Y DISTRIBUIDORES
// ============================================

export async function getClients(country?: string) {
  const { tenant } = await getOrCreateMockSession();
  
  return await prisma.client.findMany({
    where: { 
      tenantId: tenant.id,
      ...(country ? { country } : {})
    },
    include: { opportunities: true },
    orderBy: { name: 'asc' }
  });
}

export async function createClient(data: { name: string, country: string }) {
  const { tenant } = await getOrCreateMockSession();
  
  const client = await prisma.client.create({
    data: {
      name: data.name,
      country: data.country,
      tenantId: tenant.id
    }
  });
  
  revalidatePath("/");
  return client;
}

// ============================================
// MODULO PIPELINE: OPORTUNIDADES (Atadas a un Cliente)
// ============================================

export async function getOpportunities() {
  const { tenant } = await getOrCreateMockSession();
  
  return await prisma.opportunity.findMany({
    where: { tenantId: tenant.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createOpportunity(data: { title: string, amountUsd: number, clientId: string }) {
  const { tenant } = await getOrCreateMockSession();
  
  const opp = await prisma.opportunity.create({
    data: {
       title: data.title,
       amountUsd: data.amountUsd,
       status: 'PROSPECTO',
       clientId: data.clientId,
       tenantId: tenant.id
    },
    include: { client: true }
  });
  
  revalidatePath("/");
  return opp;
}

export async function updateOpportunityStatus(id: string, status: any) {
  const { tenant } = await getOrCreateMockSession();
  const opp = await prisma.opportunity.update({
    where: { id, tenantId: tenant.id },
    data: { 
      status,
      statusUpdatedAt: new Date()
    }
  });
  revalidatePath("/");
  return opp;
}

export async function deleteOpportunity(id: string) {
  const { tenant } = await getOrCreateMockSession();
  
  const oppCheck = await prisma.opportunity.findUnique({
    where: { id, tenantId: tenant.id }
  });

  if (oppCheck && oppCheck.status !== 'PROSPECTO') {
    throw new Error("No se puede eliminar una oportunidad que ya cambió de estado (Cotizada, Ganada, etc).");
  }

  const opp = await prisma.opportunity.delete({
    where: { id, tenantId: tenant.id }
  });
  revalidatePath("/");
  return opp;
}

export async function updateOpportunityConfidence(id: string, confidenceLevel: string) {
  const { tenant } = await getOrCreateMockSession();
  const opp = await prisma.opportunity.update({
    where: { id, tenantId: tenant.id },
    data: { confidenceLevel }
  });
  revalidatePath("/");
  return opp;
}

// SUPER-ADMIN: Get All Users
export async function getAllUsers() {
   const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         email: true,
         name: true,
         isPro: true,
         proSince: true,
         createdAt: true,
         country: true,
         clientUrl: true
      }
   });
   return users;
}

// SUPER-ADMIN: Toggle Pro Status
export async function toggleUserProStatus(userId: string, isPro: boolean) {
   await prisma.user.update({
      where: { id: userId },
      data: { 
         isPro,
         proSince: isPro ? new Date() : null
      }
   });
   revalidatePath("/");
   return { success: true };
}
