import { PrismaClient, Prisma } from '.';

const prisma = new PrismaClient();


export const users: Prisma.UserCreateInput[] = [
  {
    id: '1',
    username: 'admin',
    password: '',
    nickname: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    email: 'admin@youni.com',
  },
];

async function main() {
  console.log('Seeding...');

  // ...
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
