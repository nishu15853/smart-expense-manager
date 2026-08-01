import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function ImportHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = (() => {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  })();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/import/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Fetch History Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getSourceIcon = (source = "") => {
    if (source.includes("Gmail")) return "📧";
    if (source.includes("PDF")) return "📄";
    if (source.includes("CSV")) return "📊";
    return "📥";
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={currentUser} />

        <main style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                📜 Import History
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Audit log of all automated transaction import sessions from Gmail and Bank Statements.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading import history...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>📥</span>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", margin: 0 }}>
                  No Import Sessions Recorded Yet
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 0 0" }}>
                  Use the "Import Transactions" section on the Dashboard to sync emails or upload statements.
                </p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: "rgba(15, 23, 42, 0.4)",
                      color: "var(--text-muted)",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "14px 20px" }}>Source</th>
                    <th style={{ padding: "14px 20px" }}>Import Date & Time</th>
                    <th style={{ padding: "14px 20px", textAlign: "center" }}>Imported</th>
                    <th style={{ padding: "14px 20px", textAlign: "center" }}>Duplicates Skipped</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const dateObj = new Date(log.importedAt);
                    const formattedDate = dateObj.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={log._id}
                        style={{
                          borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
                          transition: "backgroundColor 0.2s",
                        }}
                      >
                        <td style={{ padding: "14px 20px", fontWeight: "600", color: "#f8fafc" }}>
                          <span style={{ fontSize: "18px", marginRight: "10px" }}>
                            {getSourceIcon(log.source)}
                          </span>
                          {log.source}
                        </td>
                        <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                          {formattedDate} at {formattedTime}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor: "rgba(34, 197, 94, 0.15)",
                              color: "#4ade80",
                              fontWeight: "700",
                              fontSize: "13px",
                            }}
                          >
                            +{log.importedCount} txns
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor: log.duplicatesCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(148, 163, 184, 0.1)",
                              color: log.duplicatesCount > 0 ? "#fbbf24" : "var(--text-muted)",
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            {log.duplicatesCount} skipped
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              backgroundColor:
                                log.status === "Success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: log.status === "Success" ? "#4ade80" : "#f87171",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            {log.status === "Success" ? "✅ Success" : "❌ Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ImportHistory;
