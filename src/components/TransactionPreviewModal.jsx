import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Salary",
  "Investment",
  "Recharge",
  "Transfer",
  "Others",
];

function TransactionPreviewModal({ previewData, onClose, onImportSuccess }) {
  const [items, setItems] = useState(previewData.items || []);
  const [saving, setSaving] = useState(false);

  const selectedCount = items.filter((i) => i.selected).length;
  const duplicatesCount = items.filter((i) => i.isDuplicate).length;

  const handleToggleSelectAll = (checked) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        // Only select non-duplicates unless explicitly overriding
        selected: checked ? !item.isDuplicate : false,
      }))
    );
  };

  const handleToggleSingle = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], selected: !copy[index].selected };
      return copy;
    });
  };

  const handleChangeField = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleImport = async (importAllMode = false) => {
    const targetItems = importAllMode
      ? items
      : items.filter((i) => i.selected);

    if (targetItems.length === 0) {
      alert("No transactions selected for import.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/import/save-batch`,
        {
          transactions: targetItems,
          source: previewData.source,
          duplicatesSkipped: duplicatesCount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`🎉 ${res.data.message}`);
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      console.error("Save Batch Error:", err);
      alert(err.response?.data?.message || "Failed to save imported transactions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          backgroundColor: "#1e293b",
          border: "1px solid rgba(51, 65, 85, 0.8)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(51, 65, 85, 0.6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
              Transaction Preview ({previewData.source})
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Review, edit AI categories, and select transactions to import into your account.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "rgba(30, 41, 59, 0.5)",
            borderBottom: "1px solid rgba(51, 65, 85, 0.4)",
            display: "flex",
            gap: "16px",
            fontSize: "13px",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#f8fafc" }}>
            Total Extracted: <strong>{items.length}</strong>
          </span>
          <span style={{ color: "#818cf8" }}>
            Selected: <strong>{selectedCount}</strong>
          </span>
          {duplicatesCount > 0 && (
            <span style={{ color: "#f87171" }}>
              Duplicates Skipped: <strong>{duplicatesCount}</strong>
            </span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleToggleSelectAll(true)}
              style={{
                fontSize: "12px",
                color: "#6366f1",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Select All Valid
            </button>
            <button
              onClick={() => handleToggleSelectAll(false)}
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Preview Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.6)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 8px", width: "40px" }}>Import</th>
                <th style={{ padding: "10px 8px" }}>Date</th>
                <th style={{ padding: "10px 8px" }}>Merchant / Title</th>
                <th style={{ padding: "10px 8px" }}>Type</th>
                <th style={{ padding: "10px 8px" }}>Category (AI)</th>
                <th style={{ padding: "10px 8px", textAlign: "right" }}>Amount (₹)</th>
                <th style={{ padding: "10px 8px" }}>UPI / Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
                    backgroundColor: item.isDuplicate
                      ? "rgba(239, 68, 68, 0.05)"
                      : item.selected
                      ? "rgba(99, 102, 241, 0.04)"
                      : "transparent",
                    opacity: item.isDuplicate && !item.selected ? 0.7 : 1,
                  }}
                >
                  <td style={{ padding: "10px 8px" }}>
                    <input
                      type="checkbox"
                      checked={!!item.selected}
                      onChange={() => handleToggleSingle(idx)}
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </td>
                  <td style={{ padding: "10px 8px", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => handleChangeField(idx, "date", e.target.value)}
                      className="form-input"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    />
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <input
                      type="text"
                      value={item.merchant || item.title}
                      onChange={(e) => {
                        handleChangeField(idx, "title", e.target.value);
                        handleChangeField(idx, "merchant", e.target.value);
                      }}
                      className="form-input"
                      style={{ padding: "4px 8px", fontSize: "12px", minWidth: "160px" }}
                    />
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <select
                      value={item.type}
                      onChange={(e) => handleChangeField(idx, "type", e.target.value)}
                      className="form-select"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <select
                      value={item.category}
                      onChange={(e) => handleChangeField(idx, "category", e.target.value)}
                      className="form-select"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "700" }}>
                    <span style={{ color: item.type === "Income" ? "#4ade80" : "#f87171" }}>
                      {item.type === "Income" ? "+" : "-"}₹{Number(item.amount).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {item.isDuplicate ? (
                      <span
                        title={item.duplicateReason}
                        style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#f87171",
                          fontWeight: "600",
                        }}
                      >
                        ⚠️ Duplicate
                      </span>
                    ) : item.upiRef ? (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Ref: {item.upiRef}
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Auto Extracted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(51, 65, 85, 0.6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Cancel Import
          </button>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleImport(true)}
              disabled={saving}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#818cf8",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Import All ({items.length})
            </button>
            <button
              onClick={() => handleImport(false)}
              disabled={saving || selectedCount === 0}
              className="btn-primary"
              style={{ padding: "10px 22px" }}
            >
              {saving ? "Importing..." : `Import Selected (${selectedCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionPreviewModal;
