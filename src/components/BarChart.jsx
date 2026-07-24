import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
function BarChart({ expenses }) {
    const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthlyExpenses = new Array(12).fill(0);
 expenses.forEach((expense) => {
    if (expense.type === "Expense") {
      const month = new Date(expense.date).getMonth();
      monthlyExpenses[month] += expense.amount;
    }
  });

  console.log(monthlyExpenses);
  const data = {
  labels: months,
  datasets: [
    {
      label: "Monthly Expenses",
      data: monthlyExpenses,
      backgroundColor: "#36A2EB",
      borderRadius: 6,
    },
  ],
};
const options = {
  responsive: true,
  maintainAspectRatio: false,
};


 return (
  <div
    style={{
      width: "700px",
      height: "400px",
      margin: "30px auto",
    }}
  >
    <h2 style={{ textAlign: "center" }}>
      Monthly Expenses
    </h2>

    <Bar data={data} options={options} />
  </div>
);
}

export default BarChart;