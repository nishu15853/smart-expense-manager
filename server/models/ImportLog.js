const mongoose = require("mongoose");

const importLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ["Gmail", "Bank Statement (PDF)", "Bank Statement (CSV)"],
      required: true,
    },
    importedCount: {
      type: Number,
      default: 0,
    },
    duplicatesCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ImportLog", importLogSchema);
