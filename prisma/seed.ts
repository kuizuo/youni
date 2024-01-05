import { PrismaClient } from '.';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // ...
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
