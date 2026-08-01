import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MetricCards from "../components/MetricCards";
import ExpenseForm from "../components/ExpenseForm";
import ImportSection from "../components/ImportSection";
import TransactionPreviewModal from "../components/TransactionPreviewModal";
import PieChart from "../components/PieChart";
import ExpenseTable from "../components/ExpenseTable";
import DateFilter from "../components/DateFilter";

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const typeFilter = "All";
  const categoryFilter = "All";

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
      // Search title filter
      const matchesSearch = !searchTerm || item.title?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "All" || item.type === typeFilter;

      // Category filter
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      if (!matchesSearch || !matchesType || !matchesCategory) return false;

      // Date filter
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

          {activeTab === "analytics" ? (
            /* Dedicated Analytics View */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", alignItems: "stretch" }}>
                <PieChart expenses={filteredExpenses} dateLabel={getDateLabel()} />
                <div
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: "0 0 16px 0" }}>
                    📈 Analytics Summary ({getDateLabel()})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "rgba(15, 23, 42, 0.5)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Total Tracked Volume:</span>
                      <strong style={{ color: "#f8fafc" }}>₹{(totalIncome + totalExpense).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Total Income:</span>
                      <strong style={{ color: "#4ade80" }}>+₹{totalIncome.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Total Expenses:</span>
                      <strong style={{ color: "#f87171" }}>-₹{totalExpense.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Net Balance:</span>
                      <strong style={{ color: totalBalance >= 0 ? "#4ade80" : "#f87171" }}>₹{totalBalance.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <ExpenseTable
                expenses={filteredExpenses}
                setEditingExpense={setEditingExpense}
                deleteExpense={deleteExpense}
                searchTerm={searchTerm}
              />
            </div>
          ) : (
            /* Main Dashboard View */
            <>
              {/* Middle Row: Quick Add Transaction Form + Import Section */}
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

                <ImportSection onPreviewTransactions={(data) => setPreviewData(data)} />
              </div>

              {/* Bottom Table: Recent Transactions */}
              <ExpenseTable
                expenses={filteredExpenses}
                setEditingExpense={setEditingExpense}
                deleteExpense={deleteExpense}
                searchTerm={searchTerm}
              />
            </>
          )}
        </main>
      </div>

      {/* Transaction Import Preview Modal */}
      {previewData && (
        <TransactionPreviewModal
          previewData={previewData}
          onClose={() => setPreviewData(null)}
          onImportSuccess={() => fetchExpenses()}
        />
      )}
    </div>
  );
}

export default Dashboard;