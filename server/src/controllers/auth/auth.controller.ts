import { Request, Response } from "express";
import { registerUser, loginUser,  registerResponder, registerOrganization, } from "../../services/auth/auth.service";

//Register
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const result = await registerUser({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

//Login
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    res.status(401).json({
      success: false,
      message,
    });
  }
};


export const registerResponderController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      responderType,
    } = req.body;

    if (!name || !email || !password || !responderType) {
      res.status(400).json({
        success: false,
        message:
          "Name, email, password and responderType are required",
      });

      return;
    }

    const result = await registerResponder({
      name,
      email,
      password,
      phone,
      responderType,
    });

    if ("error" in result) {
      if (result.error === "EMAIL_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Email already registered",
        });

        return;
      }

      res.status(400).json({
        success: false,
        message: result.error,
      });

      return;
    }

    res.status(201).json({
      success: true,
      message: "Responder registered successfully",
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
        },
        responder: result.user.responder,
      },
    });
  } catch (error) {
    console.error("Responder registration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register responder",
    });
  }
};


export const registerOrganizationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      organizationName,
      type,
      address,
      latitude,
      longitude,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !organizationName ||
      !type
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, email, password, organizationName and type are required",
      });

      return;
    }

    const result = await registerOrganization({
      name,
      email,
      password,
      phone,
      organizationName,
      type,
      address,
      latitude,
      longitude,
    });

    if ("error" in result) {
      if (result.error === "EMAIL_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Email already registered",
        });

        return;
      }

      res.status(400).json({
        success: false,
        message: result.error,
      });

      return;
    }

    res.status(201).json({
      success: true,
      message: "Organization registered successfully",
      data: {
        token: result.token,

        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
        },

        organization: result.user.organization,
      },
    });
  } catch (error) {
    console.error("Organization registration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register organization",
    });
  }
};