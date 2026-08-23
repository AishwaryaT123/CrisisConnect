import { Request, Response } from "express";
import {
  EmergencyPriority,
  EmergencyType,
} from "../../generated/prisma/client";
import { createEmergency, getMyEmergencies, getEmergencyById, cancelEmergency, } from "../../services/emergency/emergency.service";

export const createEmergencyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      type,
      description,
      priority,
      latitude,
      longitude,
    } = req.body;

    if (
      !type ||
      latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "Type, latitude and longitude are required",
      });

      return;
    }

    if (!Object.values(EmergencyType).includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid emergency type",
      });

      return;
    }

    if (
      priority !== undefined &&
      !Object.values(EmergencyPriority).includes(priority)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid emergency priority",
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

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const emergency = await createEmergency({
      userId: req.user.userId,
      type,
      description,
      priority,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: "Emergency created successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Create emergency error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create emergency",
    });
  }
};


export const getMyEmergenciesController = async (
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

    const emergencies = await getMyEmergencies(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Emergencies retrieved successfully",
      data: emergencies,
    });
  } catch (error) {
    console.error("Get my emergencies error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve emergencies",
    });
  }
};

export const getEmergencyByIdController = async (
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

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid emergency ID",
      });

      return;
    }

    const emergency = await getEmergencyById(
      id,
      req.user.userId
    );

    if (!emergency) {
      res.status(404).json({
        success: false,
        message: "Emergency not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Emergency retrieved successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Get emergency by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve emergency",
    });
  }
};


export const cancelEmergencyController = async (
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

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid emergency ID",
      });

      return;
    }

    const result = await cancelEmergency(
      id,
      req.user.userId
    );

    if (result.error === "NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Emergency not found",
      });

      return;
    }

    if (result.error === "CANNOT_CANCEL") {
      res.status(400).json({
        success: false,
        message: `Emergency cannot be cancelled when status is ${result.status}`,
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Emergency cancelled successfully",
      data: result.emergency,
    });
  } catch (error) {
    console.error("Cancel emergency error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel emergency",
    });
  }
};