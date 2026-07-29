<<<<<<< HEAD
import ExpenseForm from "../components/ExpenseForm";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";

=======
>>>>>>> 6192511 (refactor: UI components, date filtering, and resolve lint/build checks)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MetricCards from "../components/MetricCards";
import ExpenseForm from "../components/ExpenseForm";
import PieChart from "../components/PieChart";
import ExpenseTable from "../components/ExpenseTable";
import DateFilter from "../components/DateFilter";

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const totalIncome = expenses
=======
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const [dateFilter, setDateFilter] = useState("30D");
  const [customDate, setCustomDate] = useState("");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  const [currentUser, setCurrentUser] = useState(() => {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  });

  const getFilteredExpenses = () => {
    const now = new Date();
    
    // 24 hours ago
    const hours24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // 7 days ago
    const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    days7Ago.setHours(0, 0, 0, 0);

    // 30 days ago
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    days30Ago.setHours(0, 0, 0, 0);

    // 1 year ago (365 days ago)
    const year1Ago = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    year1Ago.setHours(0, 0, 0, 0);

    return expenses.filter((item) => {
      if (!item.date) return true;
      const itemDate = new Date(item.date);
      const itemDateStr = itemDate.toISOString().split("T")[0];

      switch (dateFilter) {
        case "24h":
        case "today":
          return itemDate >= hours24Ago;
        case "7D":
        case "week":
          return itemDate >= days7Ago;
        case "30D":
        case "month":
          return itemDate >= days30Ago;
        case "1Y":
        case "year":
          return itemDate >= year1Ago;
        case "custom": {
          if (customRange?.startDate && customRange?.endDate) {
            return itemDateStr >= customRange.startDate && itemDateStr <= customRange.endDate;
          }
          if (customRange?.startDate) {
            return itemDateStr >= customRange.startDate;
          }
          if (customRange?.endDate) {
            return itemDateStr <= customRange.endDate;
          }
          if (customDate) {
            return itemDateStr === customDate;
          }
          return true;
        }
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredExpenses = getFilteredExpenses();

  const getDateLabel = () => {
    switch (dateFilter) {
      case "24h":
      case "today":
        return "Last 24 Hours";
      case "7D":
      case "week":
        return "Last 7 Days";
      case "30D":
      case "month":
        return "Last 30 Days";
      case "1Y":
      case "year":
        return "Last 365 Days";
      case "custom":
        if (customRange?.startDate && customRange?.endDate) {
          return `${customRange.startDate} to ${customRange.endDate}`;
        }
        if (customRange?.startDate) return `From ${customRange.startDate}`;
        if (customRange?.endDate) return `Until ${customRange.endDate}`;
        if (customDate) return `Date: ${customDate}`;
        return "Custom Range";
      case "all":
      default:
        return "All Time";
    }
  };

  const totalIncome = filteredExpenses
>>>>>>> 6192511 (refactor: UI components, date filtering, and resolve lint/build checks)
    .filter((expense) => expense.type === "Income")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpense = filteredExpenses
    .filter((expense) => expense.type === "Expense")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/api/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.log("Fetch Expenses Error:", error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");
    const userFromUrl = queryParams.get("user");

    if (tokenFromUrl && userFromUrl) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userFromUrl));
        localStorage.setItem("token", tokenFromUrl);
        localStorage.setItem("user", JSON.stringify(parsedUser));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(parsedUser);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Error parsing user from URL:", e);
      }
    } else {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        navigate("/login");
        return;
      }
    }

    fetchExpenses();
  }, [navigate]);

  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} />

      {/* 2. Main Dashboard Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={currentUser} />

        {/* Content Container */}
        <main style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          {/* Date Filter Bar */}
          <DateFilter
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customDate={customDate}
            setCustomDate={setCustomDate}
            customRange={customRange}
            setCustomRange={setCustomRange}
          />

          {/* Top Metric Cards */}
          <MetricCards
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            expenseCount={filteredExpenses.length}
          />

          {/* Middle Row: Quick Add Transaction Form + Pie Chart */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            <ExpenseForm
              fetchExpenses={fetchExpenses}
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
            />

            <PieChart expenses={filteredExpenses} dateLabel={getDateLabel()} />
          </div>

          {/* Bottom Table: Recent Transactions */}
          <ExpenseTable
            expenses={filteredExpenses}
            setEditingExpense={setEditingExpense}
            deleteExpense={deleteExpense}
            searchTerm={searchTerm}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;