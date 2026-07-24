import ExpenseForm from "../components/ExpenseForm";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const totalIncome = expenses
    .filter((expense) => expense.type === "Income")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpense = expenses
    .filter((expense) => expense.type === "Expense")
    .reduce((sum, expense) => sum + expense.amount, 0);


  const totalBalance = totalIncome - totalExpense;
  console.log(expenses);
  const fetchExpenses = async () => {
    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/expenses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.expenses);
      console.log(response.data.expenses);


      console.log(response.data);

      setExpenses(response.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");
    const userFromUrl = queryParams.get("user");

    if (tokenFromUrl && userFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("user", userFromUrl);
      // Clean up the URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchExpenses();
  }, []);
  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE_URL}/api/expenses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Expense Deleted Successfully!");

      fetchExpenses();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Delete Failed");
    }
  };
 const filteredExpenses = expenses.filter((expense) => {
  const matchesSearch = expense.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesType =
    typeFilter === "All" || expense.type === typeFilter;
    
  const matchesCategory =
    categoryFilter === "All" ||
    expense.category === categoryFilter;

  return matchesSearch && matchesType;
});
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
          <p>₹{totalBalance}</p>
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
          <p>₹{totalIncome}</p>
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
          <p>₹{totalExpense}</p>
        </div>
      </div>
      <ExpenseForm
        fetchExpenses={fetchExpenses}
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
      />
      <h2 style={{ marginTop: "30px" }}>All Expenses</h2>
      <input
  type="text"
  placeholder="Search by title..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    padding: "10px",
    width: "300px",
    margin: "15px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  }}
/>
<select
  value={typeFilter}
  onChange={(e) => setTypeFilter(e.target.value)}
  style={{
    padding: "10px",
    marginLeft: "15px",
    borderRadius: "8px",
  }}
>
  <option value="All">All</option>
  <option value="Income">Income</option>
  <option value="Expense">Expense</option>
</select>
<select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  style={{
    padding: "10px",
    marginLeft: "15px",
    borderRadius: "8px",
  }}
>
  <option value="All">All Categories</option>
  <option value="Food">Food</option>
  <option value="Travel">Travel</option>
  <option value="Shopping">Shopping</option>
  <option value="Bills">Bills</option>
  <option value="Health">Health</option>
  <option value="Other">Other</option>
</select>
      <PieChart expenses={expenses} />
       <BarChart expenses={expenses} />

      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.title}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.type}</td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => setEditingExpense(expense)}
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(expense._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;