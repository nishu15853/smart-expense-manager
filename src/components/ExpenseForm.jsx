import { useState,useEffect  } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

function ExpenseForm( {fetchExpenses, editingExpense,setEditingExpense} ) {
  const [expense, setExpense] = useState({
    
    title: "",
    amount: "",
    category: "",
    type:"",
    date: "",
  });
  useEffect(() => {
    if (editingExpense) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpense({
      title: editingExpense.title,
      amount: editingExpense.amount,
      category: editingExpense.category,
       type: editingExpense.type,
      date: editingExpense.date
        ? editingExpense.date.split("T")[0]
        : "",
    });
  }
}, [editingExpense]);
  const handleChange = (e) => {
  
  setExpense({
    ...expense,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();
   console.log("Handle Submit Called");
   console.log("Expense State:", expense);

  try {
    const token = localStorage.getItem("token");
    if (editingExpense) {
  await axios.put(
    `${API_BASE_URL}/api/expenses/${editingExpense._id}`,
    {
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
       type: expense.type,
      date: expense.date,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  alert("Expense Updated Successfully!");

  fetchExpenses();

  setExpense({
    title: "",
    amount: "",
    category: "",
    type:"",
    date: "",
  });
setEditingExpense(null);
  return;
}
   console.log(expense);
   console.log("Sending:", {
  title: expense.title,
  amount: Number(expense.amount),
  category: expense.category,
  type: expense.type,
  date: expense.date,
});
   const response = await axios.post(
  `${API_BASE_URL}/api/expenses`,
  {
    title: expense.title,
    amount: Number(expense.amount),
    category: expense.category,
     type: expense.type,
    date: expense.date,
    // date temporarily remove
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    alert("Expense Added Successfully!");
    fetchExpenses();

    console.log(response.data);

    setExpense({
      title: "",
      amount: "",
      category: "",
       type: "",
      date: "",
    });
  } catch (error) {
  console.log("Full Error:", error);
  console.log("Response:", error.response);
  console.log("Data:", error.response?.data);

  alert(error.response?.data?.message || "Something went wrong");
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
        height: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
          {editingExpense ? "✏️ Edit Transaction" : "➕ Add Transaction"}
        </h2>
        {editingExpense && (
          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setExpense({ title: "", amount: "", category: "", type: "", date: "" });
            }}
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Grocery Shopping"
            value={expense.title}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              value={expense.amount}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={expense.type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Type</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={expense.category}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: "8px", width: "100%" }}>
          {editingExpense ? "Update Transaction" : "Save Transaction"}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;