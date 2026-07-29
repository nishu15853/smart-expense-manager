

function Header({ searchTerm, setSearchTerm, user }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const userName = user?.name || "User";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: User Welcome */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
          Here is your financial overview for {currentDate}
        </p>
      </div>

      {/* Right: Search Input & User Profile Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", width: "260px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-full)",
              color: "#f8fafc",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
          />
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "16px",
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
            cursor: "pointer",
          }}
          title={userName}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Header;
