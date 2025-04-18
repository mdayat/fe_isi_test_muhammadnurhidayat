import { logger } from "@libs/pino";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: "407bdd34-6b7c-44d5-81b1-e7926f447f1a",
        role: "lead",
        name: "John",
      },
      {
        id: "e8157de0-e552-459d-9573-09403c597d1f",
        role: "team",
        name: "Anne",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.fatal(error, "failed to seed database");
    await prisma.$disconnect();
    process.exit(1);
  });
