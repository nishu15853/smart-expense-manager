import ExpenseForm from "../components/ExpenseForm";
import { useEffect, useState } from "react";
import axios from "axios";
function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  
  const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "https://smart-expense-manager-9exq.onrender.com/api/expenses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    setExpenses(response.data.expenses);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchExpenses();
}, []);
  
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
      <ExpenseForm fetchExpenses={fetchExpenses} />
      <h2 style={{ marginTop: "30px" }}>All Expenses</h2>

{expenses.length === 0 ? (
  <p>No expenses found.</p>
) : (
  <table border="1" cellPadding="10" style={{ marginTop: "10px" }}>
    <thead>
      <tr>
        <th>Title</th>
        <th>Amount</th>
        <th>Category</th>
        <th>Date</th>
      </tr>
    </thead>

    <tbody>
      {expenses.map((expense) => (
        <tr key={expense._id}>
          <td>{expense.title}</td>
          <td>₹{expense.amount}</td>
          <td>{expense.category}</td>
          <td>{new Date(expense.date).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
  );
}

export default Dashboard;