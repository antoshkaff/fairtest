const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "teacher@fairtest.local";
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.teacher.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Teacher",
      passwordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
