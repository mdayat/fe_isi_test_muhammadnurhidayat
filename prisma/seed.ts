import { logger } from "@libs/pino";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [lead, team] = await Promise.all([
    prisma.user.create({
      data: {
        id: "407bdd34-6b7c-44d5-81b1-e7926f447f1a",
        role: "lead",
        name: "John",
      },
    }),
    prisma.user.create({
      data: {
        id: "e8157de0-e552-459d-9573-09403c597d1f",
        role: "team",
        name: "Anne",
      },
    }),
  ]);

  await Promise.all([
    prisma.task.create({
      data: {
        lead_id: lead.id,
        name: `${lead.name}'s First Task`,
        status: "done",
        description: "First Task Description",
        team_id: team.id,
        audit_logs: {
          create: {
            user_id: lead.id,
            action: "create",
            changes: JSON.stringify({
              name: `${lead.name}'s First Task`,
              status: "done",
              description: "First Task Description",
              team_id: team.id,
            }),
          },
        },
      },
    }),
    prisma.task.create({
      data: {
        lead_id: lead.id,
        name: `${lead.name}'s Second Task`,
        status: "on_progress",
        description: "Second Task Description",
        audit_logs: {
          create: {
            user_id: lead.id,
            action: "create",
            changes: JSON.stringify({
              name: `${lead.name}'s Second Task`,
              status: "on_progress",
              description: "Second Task Description",
            }),
          },
        },
      },
    }),
    prisma.task.create({
      data: {
        lead_id: lead.id,
        name: `${lead.name}'s Third Task`,
        status: "reject",
        team_id: team.id,
        audit_logs: {
          create: {
            user_id: lead.id,
            action: "create",
            changes: JSON.stringify({
              name: `${lead.name}'s Third Task`,
              status: "reject",
              team_id: team.id,
            }),
          },
        },
      },
    }),
    prisma.task.create({
      data: {
        lead_id: lead.id,
        name: `${lead.name}'s Fourth Task`,
        status: "not_started",
        audit_logs: {
          create: {
            user_id: lead.id,
            action: "create",
            changes: JSON.stringify({
              name: `${lead.name}'s Fourth Task`,
              status: "not_started",
            }),
          },
        },
      },
    }),
  ]);
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
