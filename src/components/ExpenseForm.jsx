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
    <div style={{ marginTop: "40px" }}>
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Expense Title"
          value={expense.title}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={expense.amount}
          onChange={handleChange}
          required
        />

        <br /><br />

        <select
          name="category"
          value={expense.category}
          onChange={handleChange}
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

        <br /><br />
        <select
  name="type"
  value={expense.type}
  onChange={handleChange}
  required
>
  <option value="">Select Type</option>
  <option value="Income">Income</option>
  <option value="Expense">Expense</option>
</select>

<br /><br />

        <input
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />

        <br /><br />

        <button type="submit">
         {editingExpense ? "Update Expense" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;