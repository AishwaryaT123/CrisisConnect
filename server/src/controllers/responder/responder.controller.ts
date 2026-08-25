import { Request, Response } from "express";
import { ResponderType } from "../../generated/prisma/client";
import { createResponder,  getMyResponderProfile, } from "../../services/responder/responder.service";

export const createResponderController = async (
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

    const { responderType } = req.body;

    if (!responderType) {
      res.status(400).json({
        success: false,
        message: "Responder type is required",
      });

      return;
    }

    if (!Object.values(ResponderType).includes(responderType)) {
      res.status(400).json({
        success: false,
        message: "Invalid responder type",
      });

      return;
    }

    const result = await createResponder({
      userId: req.user.userId,
      responderType,
    });

    if (result.error === "ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Responder profile already exists",
      });

      return;
    }

    res.status(201).json({
      success: true,
      message: "Responder profile created successfully",
      data: result.responder,
    });
  } catch (error) {
    console.error("Create responder error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create responder profile",
    });
  }
};


export const getMyResponderProfileController = async (
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

    const responder = await getMyResponderProfile(
      req.user.userId
    );

    if (!responder) {
      res.status(404).json({
        success: false,
        message: "Responder profile not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Responder profile retrieved successfully",
      data: responder,
    });
  } catch (error) {
    console.error("Get responder profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve responder profile",
    });
  }
};