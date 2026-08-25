import { prisma } from "../config/database";

const userId = "cmt66a63r00006grawg6v5nd5";

const makeResponder = async () => {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: "RESPONDER",
      },
    });

    console.log("User promoted to RESPONDER:");
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

makeResponder();