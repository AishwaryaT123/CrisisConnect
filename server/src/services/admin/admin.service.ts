import { prisma } from "../../config/database";
import { VerificationStatus } from "../../generated/prisma/client";

interface VerifyResponderInput {
  responderId: string;
  status: VerificationStatus;
}

export const verifyResponder = async (
  data: VerifyResponderInput
) => {
  const responder = await prisma.responder.findUnique({
    where: {
      id: data.responderId,
    },
  });

  if (!responder) {
    return {
      error: "NOT_FOUND",
    };
  }

  const updatedResponder = await prisma.responder.update({
    where: {
      id: data.responderId,
    },
    data: {
      verificationStatus: data.status,
    },
  });

  return {
    responder: updatedResponder,
  };
};