import { useEffect, useState } from "react";

import {
    cancelEmergency,
    createEmergency,
    getEmergencyById,
    getMyEmergencies,
} from "../../services/emergency/emergency.service";

import type {
    Emergency,
} from "../../services/emergency/emergency.service";

interface CitizenDashboardProps {
    userName: string;
}

const emergencyTypes = [
    {
        value: "MEDICAL",
        label: "Medical",
        icon: "🏥",
    },
    {
        value: "FIRE",
        label: "Fire",
        icon: "🔥",
    },
    {
        value: "ACCIDENT",
        label: "Accident",
        icon: "🚗",
    },
    {
        value: "SECURITY",
        label: "Security",
        icon: "🛡️",
    },
    {
        value: "NATURAL_DISASTER",
        label: "Natural Disaster",
        icon: "🌪️",
    },
    {
        value: "DOMESTIC",
        label: "Domestic",
        icon: "🏠",
    },
    {
        value: "OTHER",
        label: "Other",
        icon: "🚨",
    },
];

const priorities = [
    {
        value: "LOW",
        label: "Low",
    },
    {
        value: "MEDIUM",
        label: "Medium",
    },
    {
        value: "HIGH",
        label: "High",
    },
    {
        value: "CRITICAL",
        label: "Critical",
    },
];

const CitizenDashboard = ({
    userName,
}: CitizenDashboardProps) => {
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);

    const [selectedType, setSelectedType] = useState("MEDICAL");

    const [description, setDescription] = useState("");

    const [priority, setPriority] = useState("MEDIUM");

    const [latitude, setLatitude] = useState<number | null>(null);

    const [longitude, setLongitude] = useState<number | null>(null);

    const [locationLoading, setLocationLoading] = useState(false);

    const [creating, setCreating] = useState(false);

    const [loadingEmergencies, setLoadingEmergencies] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);

    // =====================================================
    // LOAD EMERGENCIES
    // =====================================================

    const loadEmergencies = async () => {
        try {
            setLoadingEmergencies(true);

            const data =
                await getMyEmergencies();

            setEmergencies(data);
        } catch (error) {
            console.error(
                "Failed to load emergencies:",
                error
            );
        } finally {
            setLoadingEmergencies(false);
        }
    };

    useEffect(() => {
        loadEmergencies();
    }, []);

    // =====================================================
    // GET LOCATION
    // =====================================================

    const getCurrentLocation = () => {
        setError("");
        setLocationLoading(true);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);

                setLongitude(position.coords.longitude);

                setLocationLoading(false);
            },
            (error) => {
                console.error(
                    "Location error:",
                    error
                );

                setError("Unable to get your location. Please allow location access.");

                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // =====================================================
    // CREATE EMERGENCY
    // =====================================================

    const handleCreateEmergency = async () => {
        setError("");
        setSuccess("");

        if (
            latitude === null ||
            longitude === null
        ) {
            setError("Please get your current location first.");
            return;
        }

        try {
            setCreating(true);

            await createEmergency({
                type: selectedType,
                description: description.trim() || undefined,
                priority,
                latitude,
                longitude,
            });

            setSuccess("Emergency request created successfully.");

            setDescription("");
            setPriority("MEDIUM");

            await loadEmergencies();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create emergency"
            );
        } finally {
            setCreating(false);
        }
    };

    // =====================================================
    // CANCEL EMERGENCY
    // =====================================================

    const handleCancelEmergency = async (
        emergencyId: string
    ) => {
        const confirmed = window.confirm("Are you sure you want to cancel this emergency request?");

        if (!confirmed) {
            return;
        }

        try {
            await cancelEmergency(emergencyId);

            await loadEmergencies();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to cancel emergency"
            );
        }
    };

    // =====================================================
    // REFRESH SELECTED EMERGENCY
    // =====================================================

    const refreshEmergency = async (
        emergencyId: string
    ) => {
        try {
            const updated = await getEmergencyById(emergencyId);

            setEmergencies((previous) =>
                previous.map((emergency) =>
                    emergency.id === emergencyId ? updated : emergency
                )
            );
        } catch (error) {
            console.error(
                "Failed to refresh emergency:",
                error
            );
        }
    };

    // =====================================================
    // STATUS POLLING
    // =====================================================

    useEffect(() => {
        if (!selectedEmergencyId) {
            return;
        }

        const interval = setInterval(() => {
            refreshEmergency(
                selectedEmergencyId
            );
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [selectedEmergencyId]);

    // =====================================================
    // STATUS HELPERS
    // =====================================================

    const getStatusLabel = (
        status: string
    ) => {
        switch (status) {
            case "PENDING":
                return "Request Submitted";

            case "SEARCHING":
                return "Finding Responder";

            case "ASSIGNED":
                return "Responder Assigned";

            case "ACCEPTED":
                return "Responder Accepted";

            case "EN_ROUTE":
                return "Responder En Route";

            case "ARRIVED":
                return "Responder Arrived";

            case "RESOLVED":
                return "Emergency Resolved";

            case "CANCELLED":
                return "Emergency Cancelled";

            default:
                return status;
        }
    };

    const getStatusIcon = (
        status: string
    ) => {
        switch (status) {
            case "PENDING":
                return "📨";

            case "SEARCHING":
                return "🔎";

            case "ASSIGNED":
                return "🚑";

            case "ACCEPTED":
                return "✅";

            case "EN_ROUTE":
                return "🚨";

            case "ARRIVED":
                return "📍";

            case "RESOLVED":
                return "✔️";

            case "CANCELLED":
                return "❌";

            default:
                return "🔔";
        }
    };

    const getPriorityLabel = (
        value: string
    ) => {
        return (
            priorities.find(
                (item) =>
                    item.value === value
            )?.label || value
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <main style={{ padding: "35px", maxWidth: "1400px", margin: "0 auto", }}>
            {/* PAGE TITLE */}
            <div style={{ marginBottom: "30px", }}>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "30px", }}>
                    Emergency Dashboard
                </h2>

                <p style={{ marginTop: "8px", color: "#64748b", }}>
                    Welcome, {userName}. Request emergency
                    assistance when you need it.
                </p>
            </div>

            {/* ALERTS */}

            {error && (
                <div style={{ padding: "14px 18px", marginBottom: "20px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ padding: "14px 18px", marginBottom: "20px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", }}>
                    {success}
                </div>
            )}

            {/* GRID */}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(350px, 1fr) minmax(400px, 1.4fr)", gap: "25px", alignItems: "start", }}>
                {/* CREATE EMERGENCY */}

                <section style={{ background: "#ffffff", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", }}>

                    <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "21px", }}>
                        🚨 Request Emergency Help
                    </h3>

                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "25px", }}>
                        Select the emergency type and
                        provide your current location.
                    </p>

                    {/* TYPE */}

                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "#334155", fontSize: "14px", }}>
                        Emergency Type
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "22px", }}>
                        {emergencyTypes.map(
                            (type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setSelectedType(type.value)}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "9px",
                                        border:
                                            selectedType === type.value ? "2px solid #2563eb" : "1px solid #cbd5e1",
                                        background:
                                            selectedType === type.value ? "#eff6ff" : "#ffffff",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }} >
                                    <span style={{ fontSize: "18px", }}>
                                        {type.icon}
                                    </span>{" "}

                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155", }}>
                                        {type.label}
                                    </span>
                                </button>
                            )
                        )}
                    </div>

                    {/* PRIORITY */}

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "14px", }}>
                        Priority
                    </label>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "9px",
                            marginBottom: "20px",
                            fontSize: "14px",
                            background: "#ffffff",
                        }} >
                        {priorities.map(
                            (item) => (
                                <option
                                    key={item.value}
                                    value={item.value}>
                                    {item.label}
                                </option>
                            )
                        )}
                    </select>

                    {/* DESCRIPTION */}

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "14px", }}>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your emergency..."
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "12px",
                            boxSizing: "border-box",
                            border: "1px solid #cbd5e1",
                            borderRadius: "9px",
                            resize: "vertical",
                            fontSize: "14px",
                            marginBottom: "18px",
                        }} />

                    {/* LOCATION */}

                    <div style={{ padding: "15px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "18px", }}>

                        <div style={{ fontWeight: "600", color: "#334155", fontSize: "14px", marginBottom: "7px", }}>
                            📍 Your Location
                        </div>

                        {latitude !== null && longitude !== null ? (

                            <div style={{ color: "#15803d", fontSize: "12px", }}>
                                Location captured successfully.
                                <br />
                                Latitude:{" "}
                                {latitude.toFixed(6)}
                                <br />
                                Longitude:{" "}
                                {longitude.toFixed(6)}
                            </div>
                        ) : (
                            <div style={{ color: "#64748b", fontSize: "12px", }}>
                                Location has not been captured.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            style={{
                                marginTop: "12px",
                                padding: "9px 14px",
                                border: "none",
                                borderRadius: "7px",
                                background:
                                    locationLoading ? "#94a3b8" : "#0f766e",
                                color: "#ffffff",
                                cursor:
                                    locationLoading ? "not-allowed" : "pointer",
                                fontSize: "13px",
                            }}>
                            {locationLoading ? "Getting Location..." : "Get Current Location"}
                        </button>
                    </div>

                    {/* CREATE */}

                    <button
                        type="button"
                        onClick={handleCreateEmergency}
                        disabled={creating}
                        style={{
                            width: "100%",
                            padding: "14px",
                            border: "none",
                            borderRadius: "9px",
                            background: creating ? "#94a3b8" : "#dc2626",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: creating ? "not-allowed" : "pointer",
                        }}>
                        {creating ? "Creating Emergency..." : "🚨 Send Emergency Request"}
                    </button>
                </section>

                {/* EMERGENCY HISTORY */}

                <section style={{ background: "#ffffff", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", }}>
                        <div>
                            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "21px", }}>
                                My Emergency Requests
                            </h3>

                            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "12px", }}>
                                Track your emergency requests
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadEmergencies}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "7px",
                                background: "#ffffff",
                                color: "#334155",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}>
                            ↻ Refresh
                        </button>
                    </div>

                    {/* LOADING */}

                    {loadingEmergencies && (
                        <div style={{ textAlign: "center", padding: "35px", color: "#64748b", }}>
                            Loading emergencies...
                        </div>
                    )}

                    {/* EMPTY */}

                    {!loadingEmergencies &&
                        emergencies.length === 0 && (
                            <div style={{ textAlign: "center", padding: "45px 20px", color: "#64748b", }} >
                                <div style={{ fontSize: "40px", marginBottom: "10px", }} >
                                    🆘
                                </div>

                                <div style={{ fontWeight: "600", color: "#334155", }}>
                                    No emergency requests
                                </div>

                                <p style={{ fontSize: "13px", }}>
                                    Your emergency requests will
                                    appear here.
                                </p>
                            </div>
                        )}

                    {/* LIST */}

                    {!loadingEmergencies &&
                        emergencies.map(
                            (emergency) => (
                                <div
                                    key={emergency.id}
                                    style={{
                                        border:
                                            selectedEmergencyId === emergency.id ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "18px",
                                        marginBottom: "14px",
                                        background:
                                            selectedEmergencyId === emergency.id ? "#f8fbff" : "#ffffff",
                                    }}>
                                    {/* TOP */}

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px", }} >
                                        <div>
                                            <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", }}>
                                                🚨{" "}
                                                {emergency.type}
                                            </div>

                                            <div style={{ marginTop: "5px", color: "#64748b", fontSize: "12px", }}>
                                                {new Date(emergency.createdAt).toLocaleString()}
                                            </div>
                                        </div>

                                        <span style={{ padding: "5px 9px", borderRadius: "20px", background: "#eff6ff", color: "#2563eb", fontSize: "11px", fontWeight: "700", }}>
                                            {emergency.status}
                                        </span>
                                    </div>

                                    {/* DESCRIPTION */}

                                    {emergency.description && (
                                        <p style={{ color: "#475569", fontSize: "13px", margin: "12px 0", }}>
                                            {emergency.description}
                                        </p>
                                    )}

                                    {/* INFO */}

                                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", fontSize: "12px", color: "#64748b", }}>
                                        <span>
                                            Priority:{" "}
                                            <strong>
                                                {getPriorityLabel(emergency.priority)}
                                            </strong>
                                        </span>

                                        <span>
                                            Status:{" "}
                                            <strong>
                                                {getStatusLabel(emergency.status)}
                                            </strong>
                                        </span>
                                    </div>

                                    {/* STATUS */}

                                    {selectedEmergencyId ===
                                        emergency.id && (
                                            <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #e2e8f0", }}>
                                                <div style={{ fontWeight: "700", color: "#1e293b", marginBottom: "15px", }} >
                                                    {getStatusIcon(emergency.status)}{" "}
                                                    Emergency Status
                                                </div>

                                                <div style={{ color: "#475569", fontSize: "13px", }}>
                                                    {getStatusLabel(emergency.status)}
                                                </div>

                                                {/* ASSIGNMENT */}

                                                {emergency.incidentAssignments && emergency.incidentAssignments.length > 0 && (

                                                    <div style={{ marginTop: "15px", padding: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "9px", }}>

                                                        <strong style={{ color: "#166534", fontSize: "13px", }}>
                                                            🚑 Responder Assigned
                                                        </strong>

                                                        {emergency.incidentAssignments[0].responder?.user && (
                                                            <div style={{ marginTop: "8px", color: "#475569", fontSize: "13px", }}>
                                                                <div>
                                                                    Name:{" "}
                                                                    {emergency.incidentAssignments[0].responder?.user?.name}
                                                                </div>

                                                                {emergency.incidentAssignments[0].responder?.user?.phone && (
                                                                    <div>
                                                                        Phone:{" "}
                                                                        {emergency.incidentAssignments[0].responder?.user?.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {/* ACTIONS */}

                                    <div style={{ display: "flex", gap: "10px", marginTop: "15px", }}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedEmergencyId(
                                                    selectedEmergencyId === emergency.id ? null : emergency.id
                                                )
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                border: "1px solid #2563eb",
                                                borderRadius: "7px",
                                                background: "#ffffff",
                                                color: "#2563eb",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                            }}>
                                            {selectedEmergencyId === emergency.id ? "Hide Tracking" : "Track Status"}
                                        </button>

                                        {(emergency.status === "PENDING" || emergency.status === "SEARCHING") && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelEmergency(emergency.id)}
                                                style={{
                                                    padding: "8px 12px",
                                                    border: "1px solid #dc2626",
                                                    borderRadius: "7px",
                                                    background: "#ffffff",
                                                    color: "#dc2626",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                }}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                </section>
            </div>
        </main>
    );
};

export default CitizenDashboard;