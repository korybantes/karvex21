const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Dropping constraints...");
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_driver_id_fkey;');
    console.log("Successfully dropped documents_driver_id_fkey");
  } catch (e) {
    console.error("Error dropping driver constraint:", e);
  }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_vehicle_id_fkey;');
    console.log("Successfully dropped documents_vehicle_id_fkey");
  } catch (e) {
    console.error("Error dropping vehicle constraint:", e);
  }
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
