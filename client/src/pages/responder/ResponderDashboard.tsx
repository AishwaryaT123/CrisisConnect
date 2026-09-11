import { useEffect, useState } from "react";

interface ResponderDashboardProps {
  userName: string;
}

interface Emergency {
  id: string;
  userId: string;
  type: string;
  description?: string | null;
  priority?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
}

interface Assignment {
  id: string;
  emergencyId: string;
  responderId: string;
  status?: string;
  assignedAt: string;
  acceptedAt?: string | null;
  arrivedAt?: string | null;
  resolvedAt?: string | null;
  emergency: Emergency;
}

interface ResponderProfile {
  id: string;
  responderType: string;
  availability: string;
  verificationStatus: string;
  latitude?: number | null;
  longitude?: number | null;
}

const API_URL = "http://localhost:5000/api";

const ResponderDashboard = ({
  userName,
}: ResponderDashboardProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [responder, setResponder] =
    useState<ResponderProfile | null>(null);

  const [availability, setAvailability] =
    useState("OFFLINE");

  const [updatingAvailability, setUpdatingAvailability] =
    useState(false);


  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };




  const loadResponderProfile = async () => {
    try {
      const response = await fetch(
        `${API_URL}/responders/me`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load responder profile"
        );
      }

      setResponder(data.data);

      setAvailability(
        data.data.availability
      );
    } catch (error) {
      console.error(
        "Failed to load responder profile:",
        error
      );
    }
  };




  const updateAvailability = async () => {
    try {
      setUpdatingAvailability(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/responders/availability`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            availability: availability,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update availability"
        );
      }

      setResponder(data.data);

      setAvailability(
        data.data.availability
      );

      setSuccessMessage(
        data.message || "Availability updated successfully"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to update availability:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update availability"
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };
  // =====================================================
  // LOAD ASSIGNMENTS
  // =====================================================

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/responders/assignments`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load assignments"
        );
      }

      setAssignments(data.data || []);
    } catch (error) {
      console.error(
        "Failed to load responder assignments:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };



  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.emergency.status !== "RESOLVED" &&
      assignment.emergency.status !== "CANCELLED"
  ).length;

  const resolvedAssignments = assignments.filter(
    (assignment) =>
      assignment.emergency.status === "RESOLVED"
  ).length;

  const criticalAssignments = assignments.filter(
    (assignment) =>
      assignment.emergency.priority === "CRITICAL" &&
      assignment.emergency.status !== "RESOLVED" &&
      assignment.emergency.status !== "CANCELLED"
  ).length;
  

  // =====================================================
  // LOAD ON PAGE OPEN + EVERY 10 SECONDS
  // =====================================================

  useEffect(() => {
    loadResponderProfile();
    loadAssignments();

    updateLocation();

    // Refresh assignments every 10 seconds
    const assignmentInterval = setInterval(() => {
      loadAssignments();
    }, 10000);

    // Update responder location every 30 seconds
    const locationInterval = setInterval(() => {
      updateLocation();
    }, 30000);

    return () => {
      clearInterval(assignmentInterval);
      clearInterval(locationInterval);
    };
  }, []);

  // =====================================================
  // UPDATE ASSIGNMENT STATUS
  // =====================================================

  const updateAssignment = async (
    assignmentId: string,
    action:
      | "accept"
      | "en-route"
      | "arrived"
      | "resolve"
  ) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/responders/assignments/${assignmentId}/${action}`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update assignment"
        );
      }

      await loadAssignments();
    } catch (error) {
      console.error(
        "Failed to update assignment:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update assignment"
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString();
  };



  const openLocation = (
    latitude?: number | null,
    longitude?: number | null
  ) => {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      setError("Emergency location is not available");
      return;
    }

    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(url, "_blank");
  };



  const updateLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by this browser.");
      return;
    }

    setUpdatingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await fetch(
            `${API_URL}/responders/location`,
            {
              method: "PATCH",
              headers: getHeaders(),
              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to update location"
            );
          }

          setLocation({
            latitude,
            longitude,
          });

          const message =
            data.message || "Location updated successfully";

          setLocationMessage(message);

          setTimeout(() => {
            setLocationMessage("");
          }, 3000);
        } catch (error) {
          console.error("Failed to update location:", error);

          setLocationMessage(
            error instanceof Error
              ? error.message
              : "Failed to update location"
          );
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        setLocationMessage(
          error.message || "Unable to get your location"
        );

        setUpdatingLocation(false);
      }
    );
  };
  // =====================================================
  // UI
  // =====================================================

  return (
    <main
      style={{
        padding: "35px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "30px",
          }}
        >
          Responder Dashboard
        </h2>

        <p
          style={{
            color: "#64748b",
            marginTop: "8px",
          }}
        >
          Welcome, {userName}. Manage your assigned
          emergency requests.
        </p>

        {/* =====================================================
    RESPONDER AVAILABILITY
===================================================== */}

        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                color: "#1e293b",
                fontSize: "15px",
              }}
            >
              Responder Availability
            </strong>

            <div
              style={{
                marginTop: "5px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Control whether you can receive
              emergency assignments.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
              style={{
                padding: "9px 12px",
                borderRadius: "7px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <option value="AVAILABLE">
                AVAILABLE
              </option>

              <option value="BUSY">
                BUSY
              </option>

              <option value="OFFLINE">
                OFFLINE
              </option>
            </select>

            <button
              onClick={updateAvailability}
              disabled={updatingAvailability}
              style={{
                padding: "9px 14px",
                border: "none",
                borderRadius: "7px",
                background: "#0f172a",
                color: "#ffffff",
                cursor: updatingAvailability
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                opacity: updatingAvailability
                  ? 0.6
                  : 1,
              }}
            >
              {updatingAvailability
                ? "Updating..."
                : "Update"}
            </button>
          </div>
        </div>
      </div>


      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          background: "#ffffff",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>
          📍 Location Tracking
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "15px" }}>
          Update your current location so the system can find you
          for nearby emergency assignments.
        </p>

        <button
          onClick={updateLocation}
          disabled={updatingLocation}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: updatingLocation ? "not-allowed" : "pointer",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
          }}
        >
          {updatingLocation
            ? "Updating Location..."
            : "📍 Update My Location"}
        </button>

        {location && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>Latitude:</strong>{" "}
              {location.latitude}
            </p>

            <p>
              <strong>Longitude:</strong>{" "}
              {location.longitude}
            </p>
          </div>
        )}

        {locationMessage && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              fontWeight: "600",
            }}
          >
            ✓ {locationMessage}
          </div>
        )}
      </div>



      <div
        style={{
          marginBottom: "30px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {/* TOTAL */}

        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Total Assignments
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            {totalAssignments}
          </div>
        </div>

        {/* ACTIVE */}

        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Active Emergencies
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#2563eb",
            }}
          >
            {activeAssignments}
          </div>
        </div>

        {/* RESOLVED */}

        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Resolved
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#15803d",
            }}
          >
            {resolvedAssignments}
          </div>
        </div>

        {/* CRITICAL */}

        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Critical Active
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#dc2626",
            }}
          >
            {criticalAssignments}
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            fontWeight: "600",
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div
          style={{
            padding: "40px",
            background: "#ffffff",
            borderRadius: "12px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading assigned emergencies...
        </div>
      ) : assignments.length === 0 ? (
        /* =====================================================
           NO ASSIGNMENTS
        ===================================================== */

        <div
          style={{
            padding: "50px",
            background: "#ffffff",
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "12px",
            }}
          >
            🚑
          </div>

          <h3
            style={{
              color: "#334155",
              margin: 0,
            }}
          >
            No Assigned Emergencies
          </h3>

          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            New emergency assignments will appear
            here.
          </p>
        </div>
      ) : (
        /* =====================================================
           ASSIGNMENT CARDS
        ===================================================== */

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {assignments.map((assignment) => {
            const emergency = assignment.emergency;

            return (
              <div
                key={assignment.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.05)",
                }}
              >
                {/* =====================================================
                    TITLE + STATUS
                ===================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#1e293b",
                    }}
                  >
                    🚨 {emergency.type}
                  </h3>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      fontSize: "11px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emergency.status}
                  </span>
                </div>

                {/* =====================================================
                    DESCRIPTION
                ===================================================== */}

                <p
                  style={{
                    color: "#475569",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    marginTop: "15px",
                  }}
                >
                  {emergency.description ||
                    "No description provided."}
                </p>

                {/* =====================================================
                    EMERGENCY DETAILS
                ===================================================== */}

                <div
                  style={{
                    padding: "14px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#475569",
                    lineHeight: "1.8",
                  }}
                >
                  <div>
                    <strong>Priority:</strong>{" "}
                    {emergency.priority ||
                      "Not specified"}
                  </div>

                  <div>
                    <strong>Latitude:</strong>{" "}
                    {emergency.latitude ??
                      "Not available"}
                  </div>

                  <div>
                    <strong>Longitude:</strong>{" "}
                    {emergency.longitude ??
                      "Not available"}
                  </div>

                  <div>
                    <strong>Created:</strong>{" "}
                    {formatDate(
                      emergency.createdAt
                    )}
                  </div>

                  <div>
                    <strong>Assigned:</strong>{" "}
                    {formatDate(
                      assignment.assignedAt
                    )}
                  </div>
                </div>

                {/* =====================================================
                    ASSIGNMENT ID
                ===================================================== */}

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "11px",
                    color: "#94a3b8",
                    wordBreak: "break-all",
                  }}
                >
                  Assignment ID: {assignment.id}
                </div>

                {/* =====================================================
                    ACTIONS
                ===================================================== */}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "18px",
                  }}
                >


                  {/* NAVIGATE TO EMERGENCY */}

                  {emergency.status !== "RESOLVED" &&
                    emergency.status !== "CANCELLED" && (
                      <button
                        onClick={() =>
                          openLocation(
                            emergency.latitude,
                            emergency.longitude
                          )
                        }
                        style={{
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "7px",
                          background: "#f59e0b",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        📍 Navigate
                      </button>
                    )}

                  {/* ACCEPT */}

                  {emergency.status === "ASSIGNED" && (
                    <button
                      onClick={() =>
                        updateAssignment(
                          assignment.id,
                          "accept"
                        )
                      }
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#16a34a",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      ✓ Accept
                    </button>
                  )}

                  {/* EN ROUTE */}

                  {emergency.status === "ACCEPTED" && (
                    <button
                      onClick={() =>
                        updateAssignment(
                          assignment.id,
                          "en-route"
                        )
                      }
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#2563eb",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      🚨 En Route
                    </button>
                  )}

                  {/* ARRIVED */}

                  {emergency.status === "EN_ROUTE" && (
                    <button
                      onClick={() =>
                        updateAssignment(
                          assignment.id,
                          "arrived"
                        )
                      }
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#7c3aed",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      📍 Arrived
                    </button>
                  )}

                  {/* RESOLVE */}

                  {emergency.status === "ARRIVED" && (
                    <button
                      onClick={() =>
                        updateAssignment(
                          assignment.id,
                          "resolve"
                        )
                      }
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#059669",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      ✓ Resolve
                    </button>
                  )}

                  {/* RESOLVED */}

                  {emergency.status === "RESOLVED" && (
                    <span
                      style={{
                        padding: "9px 14px",
                        borderRadius: "7px",
                        background: "#dcfce7",
                        color: "#15803d",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      ✓ Emergency Resolved
                    </span>
                  )}

                  {/* CANCELLED */}

                  {emergency.status === "CANCELLED" && (
                    <span
                      style={{
                        padding: "9px 14px",
                        borderRadius: "7px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Emergency Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default ResponderDashboard;