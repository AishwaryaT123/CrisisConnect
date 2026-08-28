import { Request, Response } from "express";
import { updateResponderLocation } from "../../services/responder/location.service";

export const updateLocationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const { latitude, longitude } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      res.status(400).json({
        success: false,
        message: "Latitude and longitude must be numbers",
      });

      return;
    }

    if (latitude < -90 || latitude > 90) {
      res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });

      return;
    }

    if (longitude < -180 || longitude > 180) {
      res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });

      return;
    }

    const result = await updateResponderLocation(
      userId,
      latitude,
      longitude
    );

    if ("error" in result) {
      if (result.error === "RESPONDER_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Responder profile not found",
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
      message: "Location updated successfully",
      data: result.responder,
    });
  } catch (error) {
    console.error("Update location error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update location",
    });
  }
};