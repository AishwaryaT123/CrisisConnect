import { prisma } from "../../config/database";
import { calculateDistance } from "../../utils/distance";

export const findRespondersForEmergency = async (
  emergencyId: string,
  radiusKm: number = 10
) => {
  const emergency = await prisma.emergency.findUnique({
    where: {
      id: emergencyId,
    },
  });

  if (!emergency) {
    return {
      error: "EMERGENCY_NOT_FOUND",
    };
  }

  const responders = await prisma.responder.findMany({
    where: {
      availability: "AVAILABLE",
      verificationStatus: "VERIFIED",
      latitude: {
        not: null,
      },
      longitude: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  const nearbyResponders = responders
    .map((responder) => {
      const distance = calculateDistance(
        emergency.latitude,
        emergency.longitude,
        responder.latitude!,
        responder.longitude!
      );

      return {
        id: responder.id,
        userId: responder.userId,
        name: responder.user.name,
        phone: responder.user.phone,
        responderType: responder.responderType,
        availability: responder.availability,
        verificationStatus: responder.verificationStatus,
        latitude: responder.latitude,
        longitude: responder.longitude,
        organization: responder.organization,
        distanceKm: Number(distance.toFixed(2)),
      };
    })
    .filter((responder) => responder.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    emergency: {
      id: emergency.id,
      type: emergency.type,
      priority: emergency.priority,
      status: emergency.status,
      latitude: emergency.latitude,
      longitude: emergency.longitude,
    },
    responders: nearbyResponders,
  };
};