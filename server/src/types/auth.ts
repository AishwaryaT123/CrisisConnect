import { UserRole } from "../generated/prisma/client";

export interface AuthPayload {
  userId: string;
  role: UserRole;
}