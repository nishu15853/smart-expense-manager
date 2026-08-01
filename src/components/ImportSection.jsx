import { useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

function ImportSection({ onPreviewTransactions }) {
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [gmailTokens, setGmailTokens] = useState(() => {
    try {
      const saved = localStorage.getItem("gmail_tokens");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const fileInputRef = useRef(null);

  // Handle Gmail Connect
  const handleConnectGmail = async () => {
    try {
      setLoadingGmail(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/import/gmail/auth-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.authUrl) {
        // Open popup for Google OAuth 2.0
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          res.data.authUrl,
          "GoogleOAuth",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth postMessage
        const messageHandler = (event) => {
          if (event.data && event.data.type === "GMAIL_CONNECTED") {
            const tokens = event.data.tokens;
            localStorage.setItem("gmail_tokens", JSON.stringify(tokens));
            setGmailTokens(tokens);
            window.removeEventListener("message", messageHandler);
            alert("✅ Gmail Account Connected Successfully!");
            // Auto fetch transactions
            fetchGmailTxns(tokens);
          }
        };

        window.addEventListener("message", messageHandler);

        // Check if popup closed manually
        const timer = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(timer);
            setLoadingGmail(false);
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Connect Gmail Error:", err);
      alert(err.response?.data?.message || "Failed to initiate Gmail connection.");
      setLoadingGmail(false);
    }
  };

  // Fetch transactions from connected Gmail
  const fetchGmailTxns = async (tokensToUse = gmailTokens) => {
    if (!tokensToUse) {
      alert("Please connect your Gmail account first.");
      return;
    }

    try {
      setLoadingGmail(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/import/gmail/fetch`,
        { tokens: tokensToUse },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.transactions && res.data.transactions.length > 0) {
        onPreviewTransactions({
          source: "Gmail Transaction Emails",
          items: res.data.transactions,
        });
      } else {
        alert("No transaction emails found in connected Gmail.");
      }
    } catch (err) {
      console.error("Fetch Gmail Error:", err);
      alert(err.response?.data?.message || "Failed to fetch transaction emails from Gmail.");
    } finally {
      setLoadingGmail(false);
    }
  };

  // Disconnect Gmail
  const handleDisconnectGmail = () => {
    localStorage.removeItem("gmail_tokens");
    setGmailTokens(null);
    alert("Gmail account disconnected.");
  };

  // Handle Bank Statement File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("statement", file);

    try {
      setLoadingFile(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/import/upload-statement`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.transactions && res.data.transactions.length > 0) {
        const fileExt = file.name.endsWith(".csv") ? "CSV" : "PDF";
        onPreviewTransactions({
          source: `Bank Statement (${fileExt})`,
          filename: file.name,
          items: res.data.transactions,
        });
      } else {
        alert("No transaction records found in the uploaded statement.");
      }
    } catch (err) {
      console.error("Upload Statement Error:", err);
      alert(err.response?.data?.message || "Failed to parse bank statement.");
    } finally {
      setLoadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
          📥 Import Transactions
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Automatically import income & expenses from Gmail emails or bank statements.
        </p>
      </div>

      {/* Feature 1: Gmail Connection Card */}
      <div
        style={{
          padding: "16px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(51, 65, 85, 0.6)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📧</span>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc", margin: 0 }}>
                Import from Gmail
              </h4>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Reads bank & payment transaction alerts (SBI, HDFC, ICICI, Axis, Paytm, etc.)
              </span>
            </div>
          </div>
          {gmailTokens && (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                fontWeight: "600",
              }}
            >
              Connected
            </span>
          )}
        </div>

        {gmailTokens ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => fetchGmailTxns()}
              disabled={loadingGmail}
              className="btn-primary"
              style={{ flex: 1, padding: "8px 14px", fontSize: "13px" }}
            >
              {loadingGmail ? "Scanning Emails..." : "🔄 Sync Gmail Transactions"}
            </button>
            <button
              onClick={handleDisconnectGmail}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={loadingGmail}
            className="btn-primary"
            style={{ width: "100%", padding: "10px", fontSize: "13px", background: "linear-gradient(135deg, #ea4335, #c5221f)" }}
          >
            {loadingGmail ? "Connecting Google OAuth..." : "Connect Gmail"}
          </button>
        )}
      </div>

      {/* Feature 2: Upload Bank Statement Card */}
      <div
        style={{
          padding: "16px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(51, 65, 85, 0.6)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📄</span>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc", margin: 0 }}>
              Upload Bank Statement
            </h4>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Supports PDF & CSV files from major Indian banks
            </span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.csv"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed rgba(99, 102, 241, 0.4)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(99, 102, 241, 0.04)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
            e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.04)";
          }}
        >
          <span style={{ fontSize: "24px", display: "block", marginBottom: "4px" }}>
            {loadingFile ? "⏳" : "📁"}
          </span>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", margin: 0 }}>
            {loadingFile ? "Parsing Statement File..." : "Click or Drag & Drop Statement File"}
          </p>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Formats: .PDF, .CSV (Max 10MB)
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImportSection;
