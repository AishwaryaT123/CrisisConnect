import { Request, Response } from "express";
import { assignNearestResponder } from "../../services/emergency/assignment.service";

export const assignResponderController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const radius = req.body?.radius
      ? Number(req.body.radius)
      : 10;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Valid emergency ID is required",
      });

      return;
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      res.status(400).json({
        success: false,
        message: "Radius must be a positive number",
      });

      return;
    }

    const result = await assignNearestResponder(
      id,
      radius
    );

    if ("error" in result) {
      if (result.error === "EMERGENCY_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Emergency not found",
        });

        return;
      }

      if (result.error === "NO_RESPONDER_AVAILABLE") {
        res.status(404).json({
          success: false,
          message:
            "No verified and available responder found nearby",
        });

        return;
      }

      if (result.error === "EMERGENCY_NOT_ASSIGNABLE") {
        res.status(400).json({
          success: false,
          message: "Emergency cannot be assigned in its current status",
        });

        return;
      }

      res.status(400).json({
        success: false,
        message: result.error,
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Responder assigned successfully",
      data: {
        assignment: result.assignment,
        distanceKm: result.distanceKm,
      },
    });
  } catch (error) {
    console.error("Assign responder error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign responder",
    });
  }
};