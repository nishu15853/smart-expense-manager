import ExpenseForm from "../components/ExpenseForm";
function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Smart Expense Manager</h1>

      <h2>Dashboard</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            width: "200px",
            borderRadius: "10px",
          }}
        >
          <h3>Total Balance</h3>
          <p>₹0</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            width: "200px",
            borderRadius: "10px",
          }}
        >
          <h3>Total Income</h3>
          <p>₹0</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            width: "200px",
            borderRadius: "10px",
          }}
        >
          <h3>Total Expense</h3>
          <p>₹0</p>
        </div>
      </div>
      <ExpenseForm />
    </div>
  );
}

export default Dashboard;