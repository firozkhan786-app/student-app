const Student = require("./models/Student");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const PASSWORD = "1234";

// middleware
app.use(express.json());
app.use(express.static("public"));

// data file path
const DATA_FILE = path.join(__dirname, "data", "data.json");

// ---------- helpers ----------
function readData(){
    try{
        const data = fs.readFileSync(DATA_FILE,"utf8");
        return JSON.parse(data);
    }catch{
        return [];
    }
}

function writeData(data){
    fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2));
}

// ---------- LOGIN ----------
app.post("/login",(req,res)=>{
    if(req.body.password === PASSWORD){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

// ---------- GET students ----------
app.get("/students",(req,res)=>{
    res.json(readData());
});

// ---------- ADD student ----------
app.post("/students",(req,res)=>{
    const data = readData();
    data.push(req.body);
    writeData(data);
    res.json({success:true});
});

// ---------- DELETE student ----------
app.delete("/students/:index",(req,res)=>{
    const data = readData();
    const i = parseInt(req.params.index);

    if(i >= 0 && i < data.length){
        data.splice(i,1);
        writeData(data);
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

// ---------- UPDATE student ----------
app.put("/students/:index",(req,res)=>{
    const data = readData();
    const i = parseInt(req.params.index);

    if(i >= 0 && i < data.length){
        data[i] = req.body;
        writeData(data);
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

// ---------- START SERVER ----------
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});