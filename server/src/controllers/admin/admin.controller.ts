import { Request, Response } from "express";
import { VerificationStatus } from "../../generated/prisma/client";
import { verifyResponder } from "../../services/admin/admin.service";

export const verifyResponderController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });

      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid responder ID",
      });

      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Verification status is required",
      });

      return;
    }

    if (!Object.values(VerificationStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });

      return;
    }

    const result = await verifyResponder({
      responderId: id,
      status,
    });

    if (result.error === "NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Responder not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Responder verification status updated successfully",
      data: result.responder,
    });
  } catch (error) {
    console.error("Verify responder error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update responder verification",
    });
  }
};