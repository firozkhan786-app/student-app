console.log("NEW VERSION - FINAL");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = "1234";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= MONGODB CONNECTION =================

if (!process.env.MONGO_URI) {
  console.log("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:");
    console.log(err);
  });

// Optional: Extra connection listeners
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("🚨 Mongoose error:", err);
});

// ================= LOGIN =================

app.post("/login", (req, res) => {
  if (req.body.password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ================= GET STUDENTS =================

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).send("Error fetching students");
  }
});

// ================= ADD STUDENT =================

app.post("/students", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json(newStudent);
  } catch (err) {
    res.status(500).send("Error saving student");
  }
});

// ================= DELETE STUDENT =================

app.delete("/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send("Error deleting student");
  }
});

// ================= UPDATE STUDENT =================

app.put("/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send("Error updating student");
  }
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});