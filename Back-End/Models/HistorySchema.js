const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    rfid: String,
    statusSelection: String,
    distributionStatus: String,
    residentId: mongoose.Schema.Types.ObjectId,
    residentName: String,
    age: Number,
    gender: String,
    barangay: String,
    municipality: String,
    contact: String,
    categoryId: mongoose.Schema.Types.ObjectId,
    categoryName: String,
    categoryDescription: String,
    amount: Number,
    scheduleDate: {
      type: Date,
      default: null,
    },
    assistanceAmount: {
      type: Number,
    },
    items: [
      {
        itemName: String,
        quantity: Number,
        unit: String,
      },
    ],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
    distributedBy: String,
    remarks: String,
    distributionDate: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("HistoryDistribution", HistorySchema);
