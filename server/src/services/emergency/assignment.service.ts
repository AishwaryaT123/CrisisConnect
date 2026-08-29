import { prisma } from "../../config/database";
import { calculateDistance } from "../../utils/distance";

export const assignNearestResponder = async (
    emergencyId: string,
    radiusKm: number = 10
) => {
    const emergency = await prisma.emergency.findUnique({
        where: {
            id: emergencyId,
        },
    });

    if (!emergency) {
        return {
            error: "EMERGENCY_NOT_FOUND",
        };
    }

    if (
        emergency.status !== "PENDING" &&
        emergency.status !== "SEARCHING"
    ) {
        return {
            error: "EMERGENCY_NOT_ASSIGNABLE",
        };
    }

    const responders = await prisma.responder.findMany({
        where: {
            availability: "AVAILABLE",
            verificationStatus: "VERIFIED",
            latitude: {
                not: null,
            },
            longitude: {
                not: null,
            },
        },
    });

    const nearbyResponders = responders
        .map((responder) => ({
            responder,
            distanceKm: calculateDistance(
                emergency.latitude,
                emergency.longitude,
                responder.latitude!,
                responder.longitude!
            ),
        }))
        .filter(
            (item) => item.distanceKm <= radiusKm
        )
        .sort(
            (a, b) => a.distanceKm - b.distanceKm
        );

    if (nearbyResponders.length === 0) {
        await prisma.emergency.update({
            where: {
                id: emergencyId,
            },
            data: {
                status: "SEARCHING",
            },
        });

        return {
            error: "NO_RESPONDER_AVAILABLE",
        };
    }

    const selected = nearbyResponders[0];

    const assignment = await prisma.$transaction(
        async (tx) => {
            const responder = await tx.responder.update({
                where: {
                    id: selected.responder.id,
                },
                data: {
                    availability: "BUSY",
                },
            });

            const createdAssignment =
                await tx.incidentAssignment.create({
                    data: {
                        emergencyId,
                        responderId: responder.id,
                    },
                    include: {
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

            await tx.emergency.update({
                where: {
                    id: emergencyId,
                },
                data: {
                    status: "ASSIGNED",
                },
            });

            return createdAssignment;
        }
    );

    return {
        assignment,
        distanceKm: Number(
            selected.distanceKm.toFixed(2)
        ),
    };
};