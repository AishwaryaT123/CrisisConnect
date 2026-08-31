import { prisma } from "../../config/database";
import { createNotification } from "../notification/notification.service";

export const acceptAssignment = async (
    userId: string,
    assignmentId: string
) => {
    const responder = await prisma.responder.findUnique({
        where: {
            userId,
        },
    });

    if (!responder) {
        return {
            error: "RESPONDER_NOT_FOUND",
        };
    }

    const assignment = await prisma.incidentAssignment.findUnique({
        where: {
            id: assignmentId,
        },
        include: {
            emergency: true,
        },
    });

    if (!assignment) {
        return {
            error: "ASSIGNMENT_NOT_FOUND",
        };
    }

    if (assignment.responderId !== responder.id) {
        return {
            error: "UNAUTHORIZED_ASSIGNMENT",
        };
    }

    if (assignment.acceptedAt) {
        return {
            error: "ALREADY_ACCEPTED",
        };
    }

    if (assignment.emergency.status !== "ASSIGNED") {
        return {
            error: "EMERGENCY_NOT_ASSIGNABLE",
        };
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.incidentAssignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                acceptedAt: new Date(),
            },
        });

        await tx.emergency.update({
            where: {
                id: assignment.emergencyId,
            },
            data: {
                status: "ACCEPTED",
            },
        });

        const assignmentWithDetails =
            await tx.incidentAssignment.findUnique({
                where: {
                    id: assignmentId,
                },
                include: {
                    emergency: true,
                    responder: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            });

        return assignmentWithDetails;
    });

    await createNotification({
        userId: assignment.emergency.userId,
        type: "EMERGENCY_ACCEPTED",
        message: "A responder has accepted your emergency request.",
    });

    return {
        assignment: result,
    };
};


export const markAssignmentEnRoute = async (
    userId: string,
    assignmentId: string
) => {
    const responder = await prisma.responder.findUnique({
        where: {
            userId,
        },
    });

    if (!responder) {
        return {
            error: "RESPONDER_NOT_FOUND",
        };
    }

    const assignment = await prisma.incidentAssignment.findUnique({
        where: {
            id: assignmentId,
        },
    });

    if (!assignment) {
        return {
            error: "ASSIGNMENT_NOT_FOUND",
        };
    }

    if (assignment.responderId !== responder.id) {
        return {
            error: "UNAUTHORIZED_ASSIGNMENT",
        };
    }

    if (!assignment.acceptedAt) {
        return {
            error: "ASSIGNMENT_NOT_ACCEPTED",
        };
    }

    const emergency = await prisma.emergency.findUnique({
        where: {
            id: assignment.emergencyId,
        },
    });

    if (!emergency) {
        return {
            error: "EMERGENCY_NOT_FOUND",
        };
    }

    if (emergency.status !== "ACCEPTED") {
        return {
            error: "EMERGENCY_NOT_ACCEPTED",
        };
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.emergency.update({
            where: {
                id: assignment.emergencyId,
            },
            data: {
                status: "EN_ROUTE",
            },
        });

        await tx.incidentAssignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                acceptedAt: assignment.acceptedAt,
            },
        });

        return tx.incidentAssignment.findUnique({
            where: {
                id: assignmentId,
            },
            include: {
                emergency: true,
                responder: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    });

    await createNotification({
        userId: emergency.userId,
        type: "EMERGENCY_EN_ROUTE",
        message: "The responder is now on the way to your location.",
    });

    return {
        assignment: result,
    };
};


export const markAssignmentArrived = async (
    userId: string,
    assignmentId: string
) => {
    const responder = await prisma.responder.findUnique({
        where: {
            userId,
        },
    });

    if (!responder) {
        return {
            error: "RESPONDER_NOT_FOUND",
        };
    }

    const assignment = await prisma.incidentAssignment.findUnique({
        where: {
            id: assignmentId,
        },
    });

    if (!assignment) {
        return {
            error: "ASSIGNMENT_NOT_FOUND",
        };
    }

    if (assignment.responderId !== responder.id) {
        return {
            error: "UNAUTHORIZED_ASSIGNMENT",
        };
    }

    if (!assignment.acceptedAt) {
        return {
            error: "ASSIGNMENT_NOT_ACCEPTED",
        };
    }

    const emergency = await prisma.emergency.findUnique({
        where: {
            id: assignment.emergencyId,
        },
    });

    if (!emergency) {
        return {
            error: "EMERGENCY_NOT_FOUND",
        };
    }

    if (emergency.status !== "EN_ROUTE") {
        return {
            error: "EMERGENCY_NOT_EN_ROUTE",
        };
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.incidentAssignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                arrivedAt: new Date(),
            },
        });

        await tx.emergency.update({
            where: {
                id: assignment.emergencyId,
            },
            data: {
                status: "ARRIVED",
            },
        });

        return tx.incidentAssignment.findUnique({
            where: {
                id: assignmentId,
            },
            include: {
                emergency: true,
                responder: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    });

    await createNotification({
        userId: emergency.userId,
        type: "EMERGENCY_ARRIVED",
        message: "The responder has arrived at your location.",
    });

    return {
        assignment: result,
    };
};


export const resolveAssignment = async (
    userId: string,
    assignmentId: string
) => {
    const responder = await prisma.responder.findUnique({
        where: {
            userId,
        },
    });

    if (!responder) {
        return {
            error: "RESPONDER_NOT_FOUND",
        };
    }

    const assignment = await prisma.incidentAssignment.findUnique({
        where: {
            id: assignmentId,
        },
    });

    if (!assignment) {
        return {
            error: "ASSIGNMENT_NOT_FOUND",
        };
    }

    if (assignment.responderId !== responder.id) {
        return {
            error: "UNAUTHORIZED_ASSIGNMENT",
        };
    }

    if (!assignment.acceptedAt) {
        return {
            error: "ASSIGNMENT_NOT_ACCEPTED",
        };
    }

    if (!assignment.arrivedAt) {
        return {
            error: "ASSIGNMENT_NOT_ARRIVED",
        };
    }

    const emergency = await prisma.emergency.findUnique({
        where: {
            id: assignment.emergencyId,
        },
    });

    if (!emergency) {
        return {
            error: "EMERGENCY_NOT_FOUND",
        };
    }

    if (emergency.status !== "ARRIVED") {
        return {
            error: "EMERGENCY_NOT_ARRIVED",
        };
    }

    const resolvedAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
        await tx.incidentAssignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                resolvedAt,
            },
        });

        await tx.emergency.update({
            where: {
                id: assignment.emergencyId,
            },
            data: {
                status: "RESOLVED",
                resolvedAt,
            },
        });

        await tx.responder.update({
            where: {
                id: responder.id,
            },
            data: {
                availability: "AVAILABLE",
            },
        });

        return tx.incidentAssignment.findUnique({
            where: {
                id: assignmentId,
            },
            include: {
                emergency: true,
                responder: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    });

    await createNotification({
        userId: emergency.userId,
        type: "EMERGENCY_RESOLVED",
        message: "Your emergency has been resolved.",
    });

    return {
        assignment: result,
    };
};