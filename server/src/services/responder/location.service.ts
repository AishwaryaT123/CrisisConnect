import { prisma } from "../../config/database";

export const updateResponderLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  const responder = await prisma.responder.findUnique({
    where: {
      userId,
    },
  });

  if (!responder) {
    return {
      error: "RESPONDER_NOT_FOUND",
    };
  }

  const updatedResponder = await prisma.responder.update({
    where: {
      userId,
    },
    data: {
      latitude,
      longitude,
    },
  });

  await prisma.locationUpdate.create({
    data: {
      responderId: responder.id,
      latitude,
      longitude,
    },
  });

  return {
    responder: updatedResponder,
  };
};