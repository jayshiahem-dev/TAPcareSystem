const mongoose = require("mongoose");

const BeneficiarySchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    middlename: { type: String, default: "" },
    lastname: { type: String, required: true },
    suffix: { type: String, default: "" },
    household_id: { type: String, required: true }, 
    relationship: { type: String, required: true }, 
    gender: { type: String, enum: ["Male", "Female"], required: true },
    religion: { type: String, default: "" },
    age: { type: Number },
    birth_date: { type: Date },
    birth_place: { type: String, default: "" },
    contact_number: { type: String, default: "" },
    educational_status: { type: String, default: "" }, 
    educational_year: { type: String, default: "" },
    course: { type: String, default: "" },
    school: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    rfid: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Beneficiary", BeneficiarySchema);
