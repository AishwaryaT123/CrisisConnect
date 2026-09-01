import { useCallback } from "react";
import { useNotifications } from "./hooks/useNotifications";

function App() {
  const userId = "cmtbqzb4o0000h4rapw8q0iu9";

  const handleNotification = useCallback(
    (notification: {
      id: string;
      userId: string;
      type: string;
      message: string;
      read: boolean;
      createdAt: string;
    }) => {
      console.log(
        "🔔 REAL-TIME NOTIFICATION:",
        notification
      );
    },
    []
  );

  useNotifications(
    userId,
    handleNotification
  );

  return (
    <div>
      <h1>CrisisConnect</h1>
    </div>
  );
}

export default App;