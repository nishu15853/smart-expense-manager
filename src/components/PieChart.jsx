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
console.log(categoryTotals);
  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
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