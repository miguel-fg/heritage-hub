import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const userId = uuidv4();
  const adminUser = await prisma.user.upsert({
    where: { casId: "hh_sys_admin" },
    create: {
      id: userId,
      casId: "hh_sys_admin",
      displayName: "System Administrator",
      permissions: "ADMIN",
      authType: "system",
    },
    update: {},
  });

  console.log(`Admin user created/verified with ID: ${adminUser.id}`);

  const modelsWithoutOwner = await prisma.model.count({
    where: { ownerId: null },
  });

  console.log(`Found ${modelsWithoutOwner} models without owner`);

  if (modelsWithoutOwner > 0) {
    const updateResult = await prisma.model.updateMany({
      where: { ownerId: null },
      data: { ownerId: adminUser.id },
    });

    console.log(
      `Successfully assigned ${updateResult.count} models to admin user`,
    );
  } else {
    console.log("All models already have owners assigned");
  }
}

main()
  .catch((e) => {
    console.error("Error during owner assignment: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
