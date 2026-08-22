import { prisma } from "../../config/database";
import {
  EmergencyPriority,
  EmergencyType,
} from "../../generated/prisma/client";

interface CreateEmergencyInput {
  userId: string;
  type: EmergencyType;
  description?: string;
  priority?: EmergencyPriority;
  latitude: number;
  longitude: number;
}

export const createEmergency = async (
  data: CreateEmergencyInput
) => {
  const emergency = await prisma.emergency.create({
    data: {
      userId: data.userId,
      type: data.type,
      description: data.description,
      priority: data.priority ?? EmergencyPriority.MEDIUM,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  return emergency;
};

