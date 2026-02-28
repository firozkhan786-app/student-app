require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = "1234";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ MongoDB Connect
mongoose.connect("mongodb+srv://12345678:Tanveer786@cluster0.1rbxbrk.mongodb.net/studentcrm?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
// ---------- LOGIN ----------
app.post("/login",(req,res)=>{
    if(req.body.password === PASSWORD){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

// ---------- GET students ----------
app.get("/students", async (req,res)=>{
    try{
        const students = await Student.find();
        res.json(students);
    }catch(err){
        res.status(500).send("Error fetching students");
    }
});

// ---------- ADD student ----------
app.post("/students", async (req,res)=>{
    try{
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.json(newStudent);
    }catch(err){
        res.status(500).send("Error saving student");
    }
});

// ---------- DELETE student ----------
app.delete("/students/:id", async (req,res)=>{
    try{
        await Student.findByIdAndDelete(req.params.id);
        res.json({success:true});
    }catch(err){
        res.status(500).send("Error deleting student");
    }
});

// ---------- UPDATE student ----------
app.put("/students/:id", async (req,res)=>{
    try{
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.json({success:true});
    }catch(err){
        res.status(500).send("Error updating student");
    }
});

// ---------- START SERVER ----------
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});