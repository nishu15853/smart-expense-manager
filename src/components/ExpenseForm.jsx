import { useState } from "react";
import axios from "axios";

function ExpenseForm() {
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });
  const handleChange = (e) => {
  setExpense({
    ...expense,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/expenses",
      expense,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Expense Added Successfully!");

    console.log(response.data);

    setExpense({
      title: "",
      amount: "",
      category: "",
      date: "",
    });
  } catch (error) {
    console.log(error);
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

        <input
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />

        <br /><br />

        <button type="submit">
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;