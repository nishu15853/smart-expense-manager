import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


function PieChart({ expenses }) {
  const categoryTotals = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
    Health: 0,
    Other: 0,
  };
  console.table(
  expenses.map((expense) => ({
    title: expense.title,
    category: expense.category,
    type: expense.type,
    amount: expense.amount,
  }))
);
  expenses.forEach((expense) => {
  if (
   expense.type === "Expense" &&
    expense.category &&
    categoryTotals.hasOwnProperty(expense.category)
  ) {
    categoryTotals[expense.category] += expense.amount;
  }
});
console.log(Object.values(categoryTotals));
console.log(categoryTotals);
console.table(expenses);
console.table(
  expenses.map((e) => ({
    title: e.title,
    type: e.type,
    category: e.category,
    amount: e.amount,
  }))
);
 const labels = ["Food", "Travel", "Shopping", "Bills", "Health", "Other"];



  const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};
const filteredData = labels
  .map((label) => ({
    label,
    value: categoryTotals[label],
    color: {
      Food: "#FF6384",
      Travel: "#36A2EB",
      Shopping: "#FFCE56",
      Bills: "#4BC0C0",
      Health: "#9966FF",
      Other: "#FF9F40",
    }[label],
  }))
  .filter((item) => item.value > 0);
  const data = {
  labels: filteredData.map((item) => item.label),
  datasets: [
    {
      label: "Expenses",
      data: filteredData.map((item) => item.value),
      backgroundColor: filteredData.map((item) => item.color),
    },
  ],
};
  return (
  <div
    style={{
      width: "500px",
      height: "500px",
      margin: "30px auto",
      padding: "20px",
      border: "1px solid #444",
      borderRadius: "12px",
      backgroundColor: "#1f1f1f",
    }}
  >
    <h2 style={{ textAlign: "center" }}>Expense by Category</h2>

    <Pie data={data} options={options} />
   
  </div>
);
}

export default PieChart;