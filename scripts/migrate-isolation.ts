import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateData() {
  console.log("🚀 Iniciando migración de datos para Aislamiento Total...");

  // 1. Encontrar todos los usuarios
  const users = await prisma.user.findMany({ include: { tenant: true } });
  
  for (const user of users) {
    if (!user.tenantId) continue;

    console.log(`Migrando datos para usuario: ${user.email} (Tenant: ${user.tenantId})`);

    // Migrar Metas del Tenant al User si el User no las tiene
    if (user.tenant) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyGoalUsd: user.monthlyGoalUsd || user.tenant.monthlyGoalUsd || 80000,
          annualGoalUsd: user.annualGoalUsd || user.tenant.annualGoalUsd || 1000000,
        }
      });
    }

    // Etiquetar Clientes huérfanos del Tenant como propiedad de este User
    const updatedClients = await prisma.client.updateMany({
      where: { tenantId: user.tenantId, userId: null },
      data: { userId: user.id }
    });
    console.log(`- Clientes etiquetados: ${updatedClients.count}`);

    // Etiquetar Oportunidades huérfanas
    const updatedOpps = await prisma.opportunity.updateMany({
      where: { tenantId: user.tenantId, userId: null },
      data: { userId: user.id }
    });
    console.log(`- Oportunidades etiquetadas: ${updatedOpps.count}`);

    // Etiquetar Catálogo huérfano
    const updatedCatalog = await prisma.catalogItem.updateMany({
      where: { tenantId: user.tenantId, userId: null },
      data: { userId: user.id }
    });
    console.log(`- Items de catálogo etiquetados: ${updatedCatalog.count}`);
  }

  console.log("✅ Migración completada. Todos los datos tienen dueño.");
}

migrateData()
  .catch(e => {
    console.error("❌ Error en migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
