function ExpenseTable({ expenses = [], setEditingExpense, deleteExpense, searchTerm = "" }) {
  const filteredExpenses = expenses.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term)
    );
  });

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Food": return "badge-food";
      case "Travel": return "badge-travel";
      case "Shopping": return "badge-shopping";
      case "Bills": return "badge-bills";
      case "Health": return "badge-health";
      default: return "badge-other";
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        marginTop: "28px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
            Recent Transactions
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Showing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🧾</p>
          <p style={{ fontSize: "16px", fontWeight: "600" }}>No transactions found</p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>
            {searchTerm ? "Try searching with a different term." : "Add a new transaction to get started!"}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Title
                </th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Category
                </th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Type
                </th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Date
                </th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Amount
                </th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const isIncome = expense.type === "Income";
                return (
                  <tr
                    key={expense._id}
                    style={{
                      borderBottom: "1px solid rgba(51, 65, 85, 0.4)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.3)")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                      <div>{expense.title}</div>
                      {expense.source && expense.source !== "Manual" ? (
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", marginTop: "4px", display: "inline-block", fontWeight: "500" }}>
                          {expense.source === "Gmail" ? "📧 Gmail Import" : "📄 Statement Import"}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span className={`badge ${getCategoryBadgeClass(expense.category)}`}>
                        {expense.category || "Other"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span className={`badge ${isIncome ? "badge-income" : "badge-expense"}`}>
                        {isIncome ? "↑ Income" : "↓ Expense"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
                      {expense.date ? new Date(expense.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "15px", fontWeight: "700", color: isIncome ? "var(--success)" : "#f8fafc" }}>
                      {isIncome ? "+" : "-"}₹{expense.amount?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          onClick={() => setEditingExpense(expense)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(99, 102, 241, 0.15)",
                            color: "var(--primary)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.15)")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExpense(expense._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(244, 63, 94, 0.15)",
                            color: "var(--danger)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--danger)")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.15)")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpenseTable;
