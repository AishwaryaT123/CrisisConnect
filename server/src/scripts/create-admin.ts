import bcrypt from "bcrypt";
import { prisma } from "../config/database";

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      if (existingAdmin.role === "ADMIN") {
        console.log("Admin already exists:");
        console.log({
          id: existingAdmin.id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        });

        return;
      }

      console.log(
        "A user with this email already exists but is not an ADMIN."
      );

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email,
        password: hashedPassword,
        phone: "9876543214",
        role: "ADMIN",
      },
    });

    console.log("Initial ADMIN created successfully:");

    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();