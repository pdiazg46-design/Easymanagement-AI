"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
     throw new Error("No autorizado: Token faltante.");
  }
  
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
  try {
     const { payload } = await jwtVerify(token, secret);
     
     const user = await prisma.user.findUnique({
       where: { id: payload.id as string },
       include: { tenant: true }
     });

     if (!user) throw new Error("Usuario no encontrado");
     
     let tenant = user.tenant;
     if (!tenant) {
         tenant = await prisma.tenant.create({
            data: { name: "Mi Empresa", annualGoalUsd: 1000000, monthlyGoalUsd: 80000 }
         });
         await prisma.user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
     }
     
     return { user, tenant };
  } catch (err) {
     throw new Error("No autorizado o sesión expirada");
  }
}

// OBTENER ACTIVIDADES
export async function getActivities() {
  const { user } = await getSession();
  
  const activities = await prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  return activities;
}

// CREAR ACTIVIDAD
export async function createActivity(data: { extractedAction: string, commitmentDateStr?: string, rawAudioText?: string, clientId?: string, opportunityId?: string }) {
  const { user } = await getSession();
  
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
  const { user } = await getSession();
  
  const activity = await prisma.activityLog.update({
    where: { id, userId: user.id },
    data: { completed }
  });

  revalidatePath("/");
  return activity;
}

// ACTUALIZAR ACTIVIDAD (EDICION MANUAL)
export async function updateActivity(id: string, data: { extractedAction: string, commitmentDateStr?: string, rawAudioText?: string }) {
  const { user } = await getSession();
  
  let commitmentDate: Date | null = undefined as any;
  if (data.commitmentDateStr !== undefined) {
     if (data.commitmentDateStr === "") {
        commitmentDate = null;
     } else {
        const [year, month, day] = data.commitmentDateStr.split('-');
        if (year && month && day) {
           commitmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        }
     }
  }

  const payload: any = {};
  if (data.extractedAction !== undefined) payload.extractedAction = data.extractedAction;
  if (data.rawAudioText !== undefined) payload.rawAudioText = data.rawAudioText;
  if (commitmentDate !== undefined) payload.commitmentDate = commitmentDate;

  const activity = await prisma.activityLog.update({
    where: { id, userId: user.id },
    data: payload
  });

  revalidatePath("/");
  return activity;
}

// ELIMINAR ACTIVIDAD
export async function deleteActivity(id: string) {
  const { user } = await getSession();
  
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
  const { user } = await getSession();
  
  return await prisma.client.findMany({
    where: { 
      userId: user.id,
      ...(country ? { country } : {})
    },
    include: { opportunities: true },
    orderBy: { name: 'asc' }
  });
}

export async function createClient(data: { name: string, country: string, region?: string }) {
  const { user, tenant } = await getSession();
  
  const client = await prisma.client.create({
    data: {
      name: data.name,
      country: data.country,
      region: data.region,
      userId: user.id,
      tenantId: tenant.id
    }
  });
  
  revalidatePath("/");
  return client;
}

export async function updateClient(id: string, data: { name?: string, country?: string, region?: string }) {
  const { user } = await getSession();
  
  const client = await prisma.client.update({
    where: { id, userId: user.id },
    data
  });
  
  revalidatePath("/");
  return client;
}

// ============================================
// MODULO PIPELINE: OPORTUNIDADES (Atadas a un Cliente)
// ============================================

export async function getOpportunities() {
  const { user } = await getSession();
  
  return await prisma.opportunity.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createOpportunity(data: { title: string, amountUsd: number, clientId: string }) {
  const { user, tenant } = await getSession();
  
  const opp = await prisma.opportunity.create({
    data: {
       title: data.title,
       amountUsd: data.amountUsd,
       status: 'PROSPECTO',
       clientId: data.clientId,
       userId: user.id,
       tenantId: tenant.id
    },
    include: { client: true }
  });
  
  revalidatePath("/");
  return opp;
}

export async function updateOpportunityStatus(id: string, status: any) {
  const { user } = await getSession();
  const opp = await prisma.opportunity.update({
    where: { id, userId: user.id },
    data: { 
      status,
      statusUpdatedAt: new Date()
    }
  });

  if (status === 'GANADO' || status === 'PERDIDO') {
      await prisma.activityLog.updateMany({
         where: { opportunityId: id, userId: user.id, completed: false },
         data: { completed: true }
      });
  }

  revalidatePath("/");
  return opp;
}

export async function deleteOpportunity(id: string) {
  const { user } = await getSession();
  
  const oppCheck = await prisma.opportunity.findUnique({
    where: { id, userId: user.id }
  });

  if (oppCheck && oppCheck.status !== 'PROSPECTO') {
    throw new Error("No se puede eliminar una oportunidad que ya cambió de estado (Cotizada, Ganada, etc).");
  }

  const opp = await prisma.opportunity.delete({
    where: { id, userId: user.id }
  });
  revalidatePath("/");
  return opp;
}

export async function updateOpportunityConfidence(id: string, confidenceLevel: string) {
  const { user } = await getSession();
  const opp = await prisma.opportunity.update({
    where: { id, userId: user.id },
    data: { confidenceLevel }
  });
  revalidatePath("/");
  return opp;
}

export async function updateOpportunityDetails(id: string, title?: string, amountUsd?: number) {
  const { user } = await getSession();
  const data: any = {};
  if (title) data.title = title;
  if (amountUsd !== undefined) data.amountUsd = amountUsd;
  
  const opp = await prisma.opportunity.update({
    where: { id, userId: user.id },
    data
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
