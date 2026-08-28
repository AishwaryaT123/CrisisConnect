import { Request, Response } from "express";
import { findRespondersForEmergency } from "../../services/emergency/emergency-responder.service";

export const getRespondersForEmergencyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const radius = req.query.radius
      ? Number(req.query.radius)
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

    const result = await findRespondersForEmergency(
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

      res.status(400).json({
        success: false,
        message: result.error,
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Responders for emergency retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Find responders for emergency error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to find responders for emergency",
    });
  }
};