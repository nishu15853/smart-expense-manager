import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ expenses = [], dateLabel = "All Time" }) {
  const categoryTotals = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
    Health: 0,
    Other: 0,
  };
  const expenseList = Array.isArray(expenses) ? expenses : [];
  console.table(
    expenseList.map((expense) => ({
      title: expense.title,
      category: expense.category,
      type: expense.type,
      amount: expense.amount,
    }))
  );
  expenseList.forEach((expense) => {
  if (
   expense.type === "Expense" &&
    expense.category &&
    Object.prototype.hasOwnProperty.call(categoryTotals, expense.category)
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



  const totalCategoryExpense = Object.values(categoryTotals).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
<<<<<<< HEAD
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
=======
  };

>>>>>>> 6192511 (refactor: UI components, date filtering, and resolve lint/build checks)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "350px",
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0, textAlign: "left" }}>
          Expense by Category
        </h2>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            color: "var(--primary)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          }}
        >
          📅 {dateLabel}
        </span>
      </div>

<<<<<<< HEAD
    <Pie data={data} options={options} />
   
  </div>
);
=======
      {totalCategoryExpense === 0 ? (
        <div style={{ marginTop: "60px", color: "#888" }}>
          <p style={{ fontSize: "18px" }}>📊 No expense data yet</p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>
            Add an expense above to view your category breakdown chart!
          </p>
        </div>
      ) : (
        <div style={{ height: "400px", marginTop: "10px" }}>
          <Pie data={data} options={options} />
        </div>
      )}
    </div>
  );
>>>>>>> 6192511 (refactor: UI components, date filtering, and resolve lint/build checks)
}

export default PieChart;