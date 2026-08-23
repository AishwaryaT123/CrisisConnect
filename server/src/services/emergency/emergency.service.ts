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

export const getMyEmergencies = async (userId: string) => {
  const emergencies = await prisma.emergency.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return emergencies;
};

export const getEmergencyById = async (
  emergencyId: string,
  userId: string
) => {
  const emergency = await prisma.emergency.findFirst({
    where: {
      id: emergencyId,
      userId,
    },
    include: {
      assignments: {
        include: {
          responder: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return emergency;
};


export const cancelEmergency = async (
  emergencyId: string,
  userId: string
) => {
  const emergency = await prisma.emergency.findFirst({
    where: {
      id: emergencyId,
      userId,
    },
  });

  if (!emergency) {
    return {
      error: "NOT_FOUND",
    };
  }

  if (
    emergency.status !== "PENDING" &&
    emergency.status !== "SEARCHING"
  ) {
    return {
      error: "CANNOT_CANCEL",
      status: emergency.status,
    };
  }

  const updatedEmergency = await prisma.emergency.update({
    where: {
      id: emergency.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return {
    emergency: updatedEmergency,
  };
};