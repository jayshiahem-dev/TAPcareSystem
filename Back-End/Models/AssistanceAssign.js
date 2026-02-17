const mongoose = require("mongoose");

const AssistanceSchema = new mongoose.Schema({
  statusSelection: {
    type: String,
    default: "Priority",
  },

  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resident",
    required: true,
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  distributionType: {
    type: String,
    enum: ["Cash", "Goods", "Relief", "Medical", "Other"],
    required: true,
  },

  items: [
    {
      itemName: String,
      quantity: Number,
      unit: String
    }
  ],

  totalAmount: {
    type: Number,
    default: 0,
  },

  scheduleDate: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Released", "Cancelled"],
    default: "Pending",
  },

  remarks: String,

}, { timestamps: true });

module.exports = mongoose.model("AssistanceAssign", AssistanceSchema);
