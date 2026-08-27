import { prisma } from "../../config/database";
import { ResponderType, AvailabilityStatus } from "../../generated/prisma/client";


interface CreateResponderInput {
  userId: string;
  responderType: ResponderType;
}

export const createResponder = async (
  data: CreateResponderInput
) => {
  const existingResponder = await prisma.responder.findUnique({
    where: {
      userId: data.userId,
    },
  });

  if (existingResponder) {
    return {
      error: "ALREADY_EXISTS",
    };
  }

  const responder = await prisma.responder.create({
    data: {
      userId: data.userId,
      responderType: data.responderType,
    },
  });

  return {
    responder,
  };
};


export const getMyResponderProfile = async (
  userId: string
) => {
  const responder = await prisma.responder.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      organization: true,
    },
  });

  return responder;
};


interface UpdateAvailabilityInput {
  userId: string;
  availability: AvailabilityStatus;
}

export const updateResponderAvailability = async (
  data: UpdateAvailabilityInput
) => {
  const responder = await prisma.responder.findUnique({
    where: {
      userId: data.userId,
    },
  });

  if (!responder) {
    return {
      error: "NOT_FOUND",
    };
  }

  if (responder.verificationStatus !== "VERIFIED") {
    return {
      error: "NOT_VERIFIED",
    };
  }

  const updatedResponder = await prisma.responder.update({
    where: {
      userId: data.userId,
    },
    data: {
      availability: data.availability,
    },
  });

  return {
    responder: updatedResponder,
  };
};
