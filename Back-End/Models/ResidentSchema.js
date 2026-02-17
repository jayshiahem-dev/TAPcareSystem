const mongoose = require("mongoose");

const ResidentSchema = new mongoose.Schema(
  {
    household_id: {
      type: String, // <-- plain string or number
      required: true,
    },

    nickname: {
      type: String,
      trim: true,
    },

    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    middlename: {
      type: String,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    suffix: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    religion: {
      type: String,
      trim: true,
    },
    civil_status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Separated"],
    },

    birth_date: {
      type: Date,
      required: true,
    },
    birth_place: {
      type: String,
      trim: true,
    },
    employment_status: {
      type: String,
      enum: ["Employed", "Unemployed", "Self-Employed", "Student", "Retired"],
    },

    classifications: {
      type: [String],
      enum: [
        "PWD",
        "Solo Parent",
        "Student",
        "Senior Citizen",
        "Indigent",
        "OFW",
        "Unemployed",
      ],
      default: [],
    },
    address: {
      type: String,
      required: true,
    },

    barangay: {
      type: String,
      required: true,
    },
    sitio: {
      type: String,
      trim: true,
    },

    municipality: {
      type: String,
      required: true,
    },

    contact_number: {
      type: String,
      trim: true,
    },

    occupation: {
      type: String,
    },

    rfid: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Deceased"],
      default: "Active",
    },

    dateRegistered: {
      type: Date,
      default: Date.now,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Resident", ResidentSchema);
