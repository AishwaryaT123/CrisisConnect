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

  /*
   * Get JWT from Local Storage.
   *
   * TEMPORARY:
   * We will replace this with the real authentication
   * system when we build the frontend login.
   */
  const token = localStorage.getItem("token");

  // =========================================================
  // 1. FETCH EXISTING NOTIFICATIONS
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

          // Calculate unread notifications
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
  // 2. REAL-TIME SOCKET.IO NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Join user's notification room
    socket.emit("join-user-room", userId);

    const handleNotification = (
      notification: Notification
    ) => {
      console.log(
        "🔔 New notification:",
        notification
      );

      setNotifications((prev) => {
        // Prevent duplicate notifications
        if (
          prev.some(
            (item) => item.id === notification.id
          )
        ) {
          return prev;
        }

        return [notification, ...prev];
      });

      // Increase unread count
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
  // 3. MARK NOTIFICATION AS READ
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
        // Update notification locally
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

        // Decrease unread count
        setUnreadCount((prev) =>
          Math.max(0, prev - 1)
        );

        console.log(
          "✅ Notification marked as read"
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
  // 4. FORMAT NOTIFICATION TYPE
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
  // 5. UI
  // =========================================================

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {/* =========================
          NOTIFICATION BELL
      ========================== */}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          fontSize: "24px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "8px",
        }}
        title="Notifications"
      >
        🔔

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              minWidth: "20px",
              height: "20px",
              padding: "0 4px",
              fontSize: "11px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =========================
          NOTIFICATION DROPDOWN
      ========================== */}

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50px",
            width: "360px",
            maxHeight: "450px",
            overflowY: "auto",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow:
              "0 5px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
          }}
        >
          {/* Header */}

          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Notifications
            </span>

            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* =========================
              EMPTY STATE
          ========================== */}

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "30px 20px",
                textAlign: "center",
                color: "#777",
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

              <div>
                No notifications
              </div>
            </div>
          ) : (
            /* =========================
               NOTIFICATION LIST
            ========================== */

            notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(
                        notification.id
                      );
                    }
                  }}
                  style={{
                    padding: "15px",
                    borderBottom:
                      "1px solid #eee",
                    cursor:
                      notification.read
                        ? "default"
                        : "pointer",
                    backgroundColor:
                      notification.read
                        ? "white"
                        : "#f0f7ff",
                  }}
                >
                  {/* Notification Type */}

                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    {formatNotificationType(
                      notification.type
                    )}
                  </div>

                  {/* Message */}

                  <div
                    style={{
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    {notification.message}
                  </div>

                  {/* Time */}

                  <small
                    style={{
                      color: "#777",
                    }}
                  >
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>

                  {/* Unread indicator */}

                  {!notification.read && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#1976d2",
                        fontWeight: "bold",
                      }}
                    >
                      ● Unread
                    </div>
                  )}
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;