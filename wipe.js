const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    await prisma.activityLog.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.client.deleteMany();
    try {
       await prisma.pushSubscription.deleteMany();
    } catch(e) {}
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    console.log("Database wiped successfully.");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
