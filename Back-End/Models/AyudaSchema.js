const mongoose = require("mongoose");

const AyudaSchema = new mongoose.Schema(
  {
    assistanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssistanceAssign",
      required: true,
    },

    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "beneficiaryModel",
    },
    status: {
      type: String,
      enum: ["Pending", "Released"],
      default: "Pending",
    },

    beneficiaryModel: {
      type: String,
      required: true,
      enum: ["Resident", "Beneficiary"], // allowed models
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ayuda", AyudaSchema);
