import { useEffect, useState } from "react";
import { socket } from "../../services/socket";
import { getToken } from "../../services/auth/auth.service";

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  userId: string;
}

const API_URL = "http://localhost:5000/api";

const NotificationBell = ({
  userId,
}: NotificationBellProps) => {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // GET NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = getToken();

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/notifications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch notifications"
          );
        }

        setNotifications(
          data.data || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // =====================================================
  // REAL-TIME SOCKET NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    const handleNotification = (
      notification: Notification
    ) => {
      console.log(
        "🔔 New real-time notification:",
        notification
      );

      /*
       * Make sure the notification belongs
       * to the currently logged-in user.
       */
      if (
        notification.userId !== userId
      ) {
        return;
      }

      setNotifications((previous) => {
        /*
         * Prevent duplicate notifications.
         */
        const alreadyExists =
          previous.some(
            (item) =>
              item.id === notification.id
          );

        if (alreadyExists) {
          return previous;
        }

        return [
          notification,
          ...previous,
        ];
      });
    };

    // Connect socket

    if (!socket.connected) {
      socket.connect();
    }

    // Join this user's private room

    socket.emit(
      "join-user-room",
      userId
    );

    console.log(
      `🔌 Joined notification room: user:${userId}`
    );

    // Listen for notifications

    socket.on(
      "notification",
      handleNotification
    );

    // Cleanup

    return () => {
      socket.off(
        "notification",
        handleNotification
      );

      socket.disconnect();

      console.log(
        "🔌 Notification socket disconnected"
      );
    };
  }, [userId]);

  // =====================================================
  // MARK AS READ
  // =====================================================

  const markAsRead = async (
    notificationId: string
  ) => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =====================================================
  // NOTIFICATION COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = (
    type: string
  ) => {
    switch (type) {
      case "RESPONDER_ASSIGNED":
        return "🚑";

      case "EMERGENCY_ACCEPTED":
        return "✅";

      case "EMERGENCY_EN_ROUTE":
        return "🚨";

      case "EMERGENCY_ARRIVED":
        return "📍";

      case "EMERGENCY_RESOLVED":
        return "✔️";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // NOTIFICATION TITLE
  // =====================================================

  const getNotificationTitle = (
    type: string
  ) => {
    switch (type) {
      case "RESPONDER_ASSIGNED":
        return "Responder Assigned";

      case "EMERGENCY_ACCEPTED":
        return "Emergency Accepted";

      case "EMERGENCY_EN_ROUTE":
        return "Responder En Route";

      case "EMERGENCY_ARRIVED":
        return "Responder Arrived";

      case "EMERGENCY_RESOLVED":
        return "Emergency Resolved";

      default:
        return "Notification";
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {/* BELL */}

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        style={{
          position: "relative",
          width: "42px",
          height: "42px",
          border: "none",
          borderRadius: "50%",
          background: "#1f2937",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "21px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Notifications"
      >
        🔔

        {/* UNREAD BADGE */}

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "20px",
              height: "20px",
              padding: "0 5px",
              borderRadius: "10px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border:
                "2px solid #111827",
              boxSizing: "border-box",
            }}
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "52px",
            right: 0,
            width: "380px",
            maxHeight: "500px",
            overflowY: "auto",
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow:
              "0 15px 40px rgba(0, 0, 0, 0.18)",
            zIndex: 1000,
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding: "16px 18px",
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <strong
              style={{
                color: "#0f172a",
                fontSize: "16px",
              }}
            >
              Notifications
            </strong>

            {unreadCount > 0 && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Loading notifications...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            notifications.length === 0 && (
              <div
                style={{
                  padding: "35px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "10px",
                  }}
                >
                  🔕
                </div>

                No notifications yet.
              </div>
            )}

          {/* NOTIFICATIONS */}

          {!loading &&
            notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (
                      !notification.read
                    ) {
                      markAsRead(
                        notification.id
                      );
                    }
                  }}
                  style={{
                    padding:
                      "15px 18px",
                    borderBottom:
                      "1px solid #f1f5f9",
                    background:
                      notification.read
                        ? "#ffffff"
                        : "#eff6ff",
                    cursor:
                      notification.read
                        ? "default"
                        : "pointer",
                    transition:
                      "background 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    {/* ICON */}

                    <div
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                        }}
                      >
                        <strong
                          style={{
                            color:
                              "#1e293b",
                            fontSize:
                              "13px",
                          }}
                        >
                          {getNotificationTitle(
                            notification.type
                          )}
                        </strong>

                        {!notification.read && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius:
                                "50%",
                              background:
                                "#2563eb",
                              marginTop:
                                "5px",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <p
                        style={{
                          margin:
                            "5px 0",
                          color:
                            "#475569",
                          fontSize:
                            "13px",
                          lineHeight:
                            "1.5",
                        }}
                      >
                        {
                          notification.message
                        }
                      </p>

                      <span
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "11px",
                        }}
                      >
                        {formatDate(
                          notification.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;