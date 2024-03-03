import { PrismaClient, Prisma } from '.';
import { hashSync } from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      id: '1',
      username: 'admin',
      password: hashSync('Aa123456', 10),
      nickname: 'admin',
      role: "Admin",
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Muffin',
      email: 'admin@youni.com',
    },
    update: {}
  })

  await prisma.user.upsert({
    where: { username: 'user' },
    create: {
      id: '2',
      username: 'user',
      password: hashSync('Aa123456', 10),
      nickname: 'user',
      role: "User",
      avatar: 'https://kuizuo.cn/img/logo.png',
      email: 'hi@kuizuo.cn',
    },
    update: {}
  })

  console.log('Seeding done!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
