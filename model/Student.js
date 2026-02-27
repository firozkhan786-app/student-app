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
    default: "New Lead"
  },

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