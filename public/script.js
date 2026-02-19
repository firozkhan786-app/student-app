async function login(){

    const pass = document.getElementById("pass").value;

    const res = await fetch("/login",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({password:pass})
    });

    const data = await res.json();

    if(data.success){
        document.getElementById("loginBox").style.display="none";
        document.getElementById("app").style.display="block";
        loadStudents();
    }else{
        alert("Wrong password");
    }
}
let studentsCache = [];

async function loadStudents(){
    const res = await fetch("/students");
    studentsCache = await res.json();
    renderList();
}

function renderList(){

    const search = document.getElementById("search").value.toLowerCase();
    const list = document.getElementById("list");
    list.innerHTML = "";

    let totalIncome = 0;
    let paidIncome = 0;
    let unpaidIncome = 0;

    studentsCache.forEach((s,index)=>{

        const fees = Number(s.fees);
        totalIncome += fees;

        if(s.status === "Paid") paidIncome += fees;
        else unpaidIncome += fees;

        if(search && !s.name.toLowerCase().includes(search)) return;

        const li = document.createElement("li");

        li.innerHTML = `
            <span>
                ${s.name} | Age: ${s.age} | Fees: ${s.fees} | ${s.date}
                <b style="color:${s.status==="Paid"?"green":"red"}">
                ${s.status || "Unpaid"}
                </b>
            </span>
            <div>
                <button onclick="toggleStatus(${index})">💰</button>
                <button onclick="deleteStudent(${index})">❌</button>
                <button onclick="editStudent(${index},'${s.name}','${s.age}','${s.fees}')">✏️</button>
            </div>
        `;

        list.appendChild(li);
    });

    document.getElementById("total").innerText =
        "Total Students: " + studentsCache.length;

    document.getElementById("income").innerText =
        `Total Income: ${totalIncome} | Paid: ${paidIncome} | Unpaid: ${unpaidIncome}`;
}


async function addStudent(){

    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const feesInput = document.getElementById("fees");

    const name = nameInput.value;
    const age = ageInput.value;
    const fees = feesInput.value;

    if(!name || !age || !fees){
        alert("Enter name, age and fees");
        return;
    }

    const date = new Date().toLocaleDateString();

    await fetch("/students",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({name,age,fees,date,status:"Unpaid"})
    });

    nameInput.value="";
    ageInput.value="";
    feesInput.value="";

    loadStudents();
}


async function deleteStudent(index){
    await fetch("/students/"+index,{ method:"DELETE" });
    loadStudents();
}


async function editStudent(index,name,age,fees){

    const newName = prompt("Edit name",name);
    const newAge = prompt("Edit age",age);
    const newFees = prompt("Edit fees",fees);

    if(!newName || !newAge || !newFees) return;

    const date = new Date().toLocaleDateString();

    await fetch("/students/"+index,{
        method:"PUT",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({
            name:newName,
            age:newAge,
            fees:newFees,
            date,
            status: studentsCache[index].status || "Unpaid"
        })
    });

    loadStudents();
}


async function toggleStatus(index){

    const s = studentsCache[index];

    const newStatus = s.status === "Paid" ? "Unpaid" : "Paid";

    await fetch("/students/"+index,{
        method:"PUT",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({
            ...s,
            status:newStatus
        })
    });

    loadStudents();
}

loadStudents();
function exportCSV(){

    let csv = "Name,Age,Fees,Date,Status\n";

    studentsCache.forEach(s=>{
        csv += `${s.name},${s.age},${s.fees},${s.date},${s.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
}

