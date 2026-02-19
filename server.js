const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PASSWORD = "1234";


app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data", "data.json");

function readData(){
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data){
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


// GET students
app.get("/students", (req, res) => {
    res.json(readData());
});


// ADD student
app.post("/students", (req, res) => {
    const data = readData();
    data.push(req.body);
    writeData(data);
    res.json({ success:true });
});


// DELETE student
app.delete("/students/:index", (req,res)=>{
    const data = readData();
    data.splice(req.params.index,1);
    writeData(data);
    res.json({success:true});
});


// UPDATE student
app.put("/students/:index",(req,res)=>{
    const data = readData();
    data[req.params.index] = req.body;
    writeData(data);
    res.json({success:true});
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
app.post("/login",(req,res)=>{
    if(req.body.password === PASSWORD){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

