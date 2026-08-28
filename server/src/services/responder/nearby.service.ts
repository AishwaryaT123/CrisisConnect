import { prisma } from "../../config/database";
import { calculateDistance } from "../../utils/distance";

export const findNearbyResponders = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
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
        latitude,
        longitude,
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

  return nearbyResponders;
};