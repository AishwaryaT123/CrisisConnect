import { Request, Response } from "express";
import { findNearbyResponders } from "../../services/responder/nearby.service";

export const getNearbyRespondersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = req.query.radius
      ? Number(req.query.radius)
      : 10;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
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

    const responders = await findNearbyResponders(
      latitude,
      longitude,
      radius
    );

    res.status(200).json({
      success: true,
      message: "Nearby responders retrieved successfully",
      data: responders,
    });
  } catch (error) {
    console.error("Nearby responders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to find nearby responders",
    });
  }
};