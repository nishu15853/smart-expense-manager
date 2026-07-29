function MetricCards({ totalBalance, totalIncome, totalExpense, expenseCount = 0 }) {
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "28px",
      }}
    >
      {/* 1. Total Balance Card (Featured Gradient Card) */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          color: "#ffffff",
          boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Balance
          </span>
          <span style={{ fontSize: "20px" }}>💳</span>
        </div>
        <h3 style={{ fontSize: "28px", fontWeight: "700", margin: "12px 0 6px 0", letterSpacing: "-0.5px" }}>
          ₹{totalBalance.toLocaleString("en-IN")}
        </h3>
        <p style={{ fontSize: "12px", opacity: 0.85 }}>
          Net balance available
        </p>
      </div>

      {/* 2. Total Income Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Income
          </span>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--success-light)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📈
          </div>
        </div>
        <h3 style={{ fontSize: "26px", fontWeight: "700", color: "#f8fafc", margin: "12px 0 6px 0", letterSpacing: "-0.5px" }}>
          ₹{totalIncome.toLocaleString("en-IN")}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--success)", backgroundColor: "var(--success-light)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
            +Income
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total credited</span>
        </div>
      </div>

      {/* 3. Total Expense Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Expenses
          </span>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📉
          </div>
        </div>
        <h3 style={{ fontSize: "26px", fontWeight: "700", color: "#f8fafc", margin: "12px 0 6px 0", letterSpacing: "-0.5px" }}>
          ₹{totalExpense.toLocaleString("en-IN")}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--danger)", backgroundColor: "var(--danger-light)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
            {expenseCount} Records
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Spent so far</span>
        </div>
      </div>

      {/* 4. Savings Progress Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Savings Rate
          </span>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--info-light)",
              color: "var(--info)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🎯
          </div>
        </div>
        <h3 style={{ fontSize: "26px", fontWeight: "700", color: "#f8fafc", margin: "12px 0 6px 0", letterSpacing: "-0.5px" }}>
          {savingsRate >= 0 ? `${savingsRate}%` : "0%"}
        </h3>
        <div style={{ marginTop: "8px" }}>
          <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(51, 65, 85, 0.6)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, savingsRate))}%`,
                height: "100%",
                background: "linear-gradient(90deg, #06b6d4, #10b981)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricCards;
