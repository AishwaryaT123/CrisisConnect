import NotificationBell from "./components/notification/NotificationBell";

function App() {
  const userId = "cmtbqzb4o0000h4rapw8q0iu9";


  
  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1>CrisisConnect</h1>

        <NotificationBell userId={userId} />
      </header>

      <main style={{ padding: "30px" }}>
        <h2>Emergency Dashboard</h2>
      </main>
    </div>
  );
}

export default App;