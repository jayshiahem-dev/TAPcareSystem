const mongoose = require("mongoose");

const AssistanceSchema = new mongoose.Schema(
  {
    assistanceName: {
      type: String,
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
        unit: String,
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },
    beneficiaryLimit: {
      type: Number,
      default: 0,
    },

    scheduleDate: {
      type: Date,
      default: null,
    },

    Archived: {
      type: Boolean,
      default: false,
    },
    statusCreated: {
      type: String,
      enum: ["Accomplish", "NotAccomplish"],
      default: "NotAccomplish",
    },

    remarks: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssistanceAssign", AssistanceSchema);
