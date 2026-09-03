import { useEffect, useState } from "react";
import { socket } from "../../services/socket";

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  userId: string;
}

const NotificationBell = ({ userId }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const token = localStorage.getItem("token");

  // =========================================================
  // FETCH EXISTING NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        console.error("JWT token not found in Local Storage");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications",
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
          console.error(
            "Failed to fetch notifications:",
            data
          );
          return;
        }

        if (data.success) {
          const fetchedNotifications: Notification[] =
            data.data.notifications || data.data;

          setNotifications(fetchedNotifications);

          const unread = fetchedNotifications.filter(
            (notification) => !notification.read
          ).length;

          setUnreadCount(unread);
        }
      } catch (error) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      }
    };

    fetchNotifications();
  }, [userId, token]);

  // =========================================================
  // REAL-TIME SOCKET.IO NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-user-room", userId);

    const handleNotification = (
      notification: Notification
    ) => {
      console.log(
        "🔔 New notification:",
        notification
      );

      setNotifications((prev) => {
        if (
          prev.some(
            (item) => item.id === notification.id
          )
        ) {
          return prev;
        }

        return [notification, ...prev];
      });

      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on(
      "notification",
      handleNotification
    );

    return () => {
      socket.off(
        "notification",
        handleNotification
      );
    };
  }, [userId]);

  // =========================================================
  // MARK NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (
    notificationId: string
  ) => {
    if (!token) {
      console.error(
        "JWT token not found in Local Storage"
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
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
        console.error(
          "Failed to mark notification as read:",
          data
        );
        return;
      }

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                ...notification,
                read: true,
              }
              : notification
          )
        );

        setUnreadCount((prev) =>
          Math.max(0, prev - 1)
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (type: string) => {
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
        return "🎉";

      default:
        return "🔔";
    }
  };

  // =========================================================
  // NOTIFICATION TITLE
  // =========================================================

  const formatNotificationType = (
    type: string
  ) => {
    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        position: "relative",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* =====================================================
          NOTIFICATION BUTTON
      ====================================================== */}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: "48px",
          height: "48px",
          border: "none",
          borderRadius: "12px",
          background: isOpen
            ? "#e8eef7"
            : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "#e8eef7";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              "transparent";
          }
        }}
        title="Notifications"
      >
        <span
          style={{
            fontSize: "27px",
            lineHeight: 1,
          }}
        >
          🔔
        </span>

        {/* Unread Badge */}

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              minWidth: "21px",
              height: "21px",
              padding: "0 5px",
              borderRadius: "999px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #111827",
              boxSizing: "border-box",
            }}
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =====================================================
          NOTIFICATION DROPDOWN
      ====================================================== */}

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "58px",
            right: "0",
            width: "390px",
            maxWidth:
              "calc(100vw - 30px)",
            background: "#ffffff",
            borderRadius: "16px",
            border:
              "1px solid #e5e7eb",
            boxShadow:
              "0 20px 50px rgba(0, 0, 0, 0.18)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* =================================================
              HEADER
          ================================================== */}

          <div
            style={{
              padding: "18px 20px",
              borderBottom:
                "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#ffffff",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Notifications
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Stay updated with your emergency
              </div>
            </div>

            {/* Unread Count */}

            {unreadCount > 0 && (
              <span
                style={{
                  padding:
                    "5px 10px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* =================================================
              NOTIFICATION LIST
          ================================================== */}

          <div
            style={{
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {notifications.length === 0 ? (
              /* EMPTY STATE */

              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    margin: "0 auto 15px",
                    borderRadius: "50%",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  🔕
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  No notifications
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  You're all caught up.
                </div>
              </div>
            ) : (
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
                        "16px 18px",
                      borderBottom:
                        "1px solid #f0f1f3",
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
                    onMouseEnter={(e) => {
                      if (
                        !notification.read
                      ) {
                        e.currentTarget.style.background =
                          "#e8f1ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !notification.read
                      ) {
                        e.currentTarget.style.background =
                          "#eff6ff";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "13px",
                        alignItems:
                          "flex-start",
                      }}
                    >
                      {/* ICON */}

                      <div
                        style={{
                          flexShrink: 0,
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background:
                            notification.read
                              ? "#f3f4f6"
                              : "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
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
                          minWidth: 0,
                        }}
                      >
                        {/* Title */}

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "14px",
                              fontWeight:
                                notification.read
                                  ? "600"
                                  : "700",
                              color:
                                "#1f2937",
                            }}
                          >
                            {formatNotificationType(
                              notification.type
                            )}
                          </span>

                          {/* Unread Dot */}

                          {!notification.read && (
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                flexShrink: 0,
                                borderRadius:
                                  "50%",
                                background:
                                  "#2563eb",
                              }}
                            />
                          )}
                        </div>

                        {/* Message */}

                        <div
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "13px",
                            lineHeight:
                              "1.5",
                            color:
                              "#6b7280",
                          }}
                        >
                          {
                            notification.message
                          }
                        </div>

                        {/* Time */}

                        <div
                          style={{
                            marginTop:
                              "8px",
                            fontSize:
                              "11px",
                            color:
                              "#9ca3af",
                          }}
                        >
                          🕒{" "}
                          {formatTime(
                            notification.createdAt
                          )}
                        </div>

                        {/* Unread Text */}

                        {!notification.read && (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              fontSize:
                                "11px",
                              color:
                                "#2563eb",
                              fontWeight:
                                "600",
                            }}
                          >
                            Click to mark as
                            read
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          {notifications.length > 0 && (
            <div
              style={{
                padding:
                  "11px 18px",
                borderTop:
                  "1px solid #e5e7eb",
                background:
                  "#f9fafb",
                textAlign: "center",
                fontSize: "11px",
                color: "#9ca3af",
              }}
            >
              CrisisConnect • Emergency
              Notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;