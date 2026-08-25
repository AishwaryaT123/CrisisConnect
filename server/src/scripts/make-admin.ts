import { prisma } from "../config/database";

const userEmail = "admin@crisisconnect.com";

const makeAdmin = async () => {
  try {
    const user = await prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        role: "ADMIN",
      },
    });

    console.log("User promoted to ADMIN:");

    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Failed to promote user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

makeAdmin();