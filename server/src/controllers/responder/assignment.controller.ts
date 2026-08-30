import { Request, Response } from "express";
import { acceptAssignment, markAssignmentEnRoute, markAssignmentArrived, resolveAssignment, } from "../../services/responder/assignment.service";

export const acceptAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { assignmentId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        if (!assignmentId || Array.isArray(assignmentId)) {
            res.status(400).json({
                success: false,
                message: "Valid assignment ID is required",
            });

            return;
        }

        const result = await acceptAssignment(
            userId,
            assignmentId
        );

        if ("error" in result) {
            switch (result.error) {
                case "RESPONDER_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Responder profile not found",
                    });
                    return;

                case "ASSIGNMENT_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Assignment not found",
                    });
                    return;

                case "UNAUTHORIZED_ASSIGNMENT":
                    res.status(403).json({
                        success: false,
                        message: "This assignment does not belong to you",
                    });
                    return;

                case "ALREADY_ACCEPTED":
                    res.status(400).json({
                        success: false,
                        message: "Assignment has already been accepted",
                    });
                    return;

                case "EMERGENCY_NOT_ASSIGNABLE":
                    res.status(400).json({
                        success: false,
                        message: "Emergency cannot be accepted in its current status",
                    });
                    return;

                default:
                    res.status(400).json({
                        success: false,
                        message: result.error,
                    });
                    return;
            }
        }

        res.status(200).json({
            success: true,
            message: "Assignment accepted successfully",
            data: result.assignment,
        });
    } catch (error) {
        console.error("Accept assignment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to accept assignment",
        });
    }
};


export const markAssignmentEnRouteController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { assignmentId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        if (!assignmentId || Array.isArray(assignmentId)) {
            res.status(400).json({
                success: false,
                message: "Valid assignment ID is required",
            });

            return;
        }

        const result = await markAssignmentEnRoute(
            userId,
            assignmentId
        );

        if ("error" in result) {
            switch (result.error) {
                case "RESPONDER_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Responder profile not found",
                    });
                    return;

                case "ASSIGNMENT_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Assignment not found",
                    });
                    return;

                case "UNAUTHORIZED_ASSIGNMENT":
                    res.status(403).json({
                        success: false,
                        message: "This assignment does not belong to you",
                    });
                    return;

                case "ASSIGNMENT_NOT_ACCEPTED":
                    res.status(400).json({
                        success: false,
                        message: "Assignment must be accepted first",
                    });
                    return;

                case "EMERGENCY_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Emergency not found",
                    });
                    return;

                case "EMERGENCY_NOT_ACCEPTED":
                    res.status(400).json({
                        success: false,
                        message: "Emergency must be ACCEPTED before going EN_ROUTE",
                    });
                    return;

                default:
                    res.status(400).json({
                        success: false,
                        message: result.error,
                    });
                    return;
            }
        }

        res.status(200).json({
            success: true,
            message: "Responder is now en route",
            data: result.assignment,
        });
    } catch (error) {
        console.error("Mark assignment en route error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark responder as en route",
        });
    }
};


export const markAssignmentArrivedController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { assignmentId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        if (!assignmentId || Array.isArray(assignmentId)) {
            res.status(400).json({
                success: false,
                message: "Valid assignment ID is required",
            });

            return;
        }

        const result = await markAssignmentArrived(
            userId,
            assignmentId
        );

        if ("error" in result) {
            switch (result.error) {
                case "RESPONDER_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Responder profile not found",
                    });
                    return;

                case "ASSIGNMENT_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Assignment not found",
                    });
                    return;

                case "UNAUTHORIZED_ASSIGNMENT":
                    res.status(403).json({
                        success: false,
                        message: "This assignment does not belong to you",
                    });
                    return;

                case "ASSIGNMENT_NOT_ACCEPTED":
                    res.status(400).json({
                        success: false,
                        message: "Assignment must be accepted first",
                    });
                    return;

                case "EMERGENCY_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Emergency not found",
                    });
                    return;

                case "EMERGENCY_NOT_EN_ROUTE":
                    res.status(400).json({
                        success: false,
                        message: "Emergency must be EN_ROUTE before marking arrival",
                    });
                    return;

                default:
                    res.status(400).json({
                        success: false,
                        message: result.error,
                    });
                    return;
            }
        }

        res.status(200).json({
            success: true,
            message: "Responder arrival recorded successfully",
            data: result.assignment,
        });
    } catch (error) {
        console.error("Mark assignment arrived error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record responder arrival",
        });
    }
};


export const resolveAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { assignmentId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        if (!assignmentId || Array.isArray(assignmentId)) {
            res.status(400).json({
                success: false,
                message: "Valid assignment ID is required",
            });

            return;
        }

        const result = await resolveAssignment(
            userId,
            assignmentId
        );

        if ("error" in result) {
            switch (result.error) {
                case "RESPONDER_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Responder profile not found",
                    });
                    return;

                case "ASSIGNMENT_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Assignment not found",
                    });
                    return;

                case "UNAUTHORIZED_ASSIGNMENT":
                    res.status(403).json({
                        success: false,
                        message: "This assignment does not belong to you",
                    });
                    return;

                case "ASSIGNMENT_NOT_ACCEPTED":
                    res.status(400).json({
                        success: false,
                        message: "Assignment must be accepted first",
                    });
                    return;

                case "ASSIGNMENT_NOT_ARRIVED":
                    res.status(400).json({
                        success: false,
                        message: "Responder must arrive before resolving emergency",
                    });
                    return;

                case "EMERGENCY_NOT_FOUND":
                    res.status(404).json({
                        success: false,
                        message: "Emergency not found",
                    });
                    return;

                case "EMERGENCY_NOT_ARRIVED":
                    res.status(400).json({
                        success: false,
                        message: "Emergency must be ARRIVED before resolution",
                    });
                    return;

                default:
                    res.status(400).json({
                        success: false,
                        message: result.error,
                    });
                    return;
            }
        }

        res.status(200).json({
            success: true,
            message: "Emergency resolved successfully",
            data: result.assignment,
        });
    } catch (error) {
        console.error("Resolve assignment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to resolve emergency",
        });
    }
};