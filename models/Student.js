const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  name: { type: String, required: true },
  phone: String,
  country: String,

  totalFees: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      "New Lead",
      "Contacted",
      "Documents Pending",
      "Applied",
      "Visa Approved",
      "Rejected"
    ],
    default: "New Lead"
  },

  followUpDate: Date,   // ✅ ADD THIS

  notes: String,

  payments: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);