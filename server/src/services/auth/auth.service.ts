import bcrypt from "bcrypt";
import { prisma } from "../../config/database";
import { UserRole } from "../../generated/prisma/client";
import { generateToken } from "../../utils/jwt";

//Register
interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role ?? UserRole.CITIZEN,
    },
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

//Login
interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};
