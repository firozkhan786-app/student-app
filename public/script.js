let students = [];
let studentsChart, countryChart;

// LOGIN
function login(){
    const pass=document.getElementById("pass").value;

    fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({password:pass})
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.success){
            document.getElementById("loginBox").style.display="none";
            document.getElementById("app").style.display="block";
            loadStudents();
        }else{
            alert("Wrong password");
        }
    });
}

// LOAD STUDENTS
function loadStudents(){
    fetch("/students")
    .then(res=>res.json())
    .then(data=>{
        students=data;
        renderList();
    });
}

// ADD STUDENT
function addStudent(){

    const student={
        name:document.getElementById("name").value || "No Name",
        phone:document.getElementById("phone").value || "",
        country:document.getElementById("country").value || "",
        totalFees:Number(document.getElementById("fees").value || 0),
        status:document.getElementById("status").value || "New Lead",
        notes:document.getElementById("notes").value || ""
    };

    fetch("/students",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(student)
    }).then(()=>{
        clearForm();
        loadStudents();
    });
}

// ADD PAYMENT
function addPayment(index){

    const amount = prompt("Enter payment amount:");

    if(!amount || isNaN(amount)) return;

    const student = students[index];

    if(!student.payments){
        student.payments=[];
    }

    student.payments.push({
        amount:Number(amount),
        date:new Date().toISOString().split("T")[0]
    });

    fetch("/students/"+student._id,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(student)
    }).then(()=>{
        loadStudents();
    });
}

// RENDER CARDS
function renderCards(){

    const box=document.getElementById("cards");

    let total=students.length;
    let revenue=0;
    let totalDue=0;

    students.forEach(s=>{

        const totalPaid = (s.payments || []).reduce((sum,p)=>sum+Number(p.amount||0),0);
        const due = Number(s.totalFees||0) - totalPaid;

        revenue+=Number(s.totalFees||0);
        totalDue+=due;
    });

    box.innerHTML=`
    <div class="card">Total<br><b>${total}</b></div>
    <div class="card">Revenue<br><b>₹${revenue}</b></div>
    <div class="card">Total Due<br><b>₹${totalDue}</b></div>
    `;
}

// RENDER LIST
function renderList(){

    const ul=document.getElementById("list");
    const searchText=document.getElementById("search").value.toLowerCase();

    ul.innerHTML="";
    renderCards();

    students.forEach((s,i)=>{

        const totalPaid = (s.payments || []).reduce((sum,p)=>sum+Number(p.amount||0),0);
        const due = Number(s.totalFees||0) - totalPaid;

        const text=(s.name+s.phone+s.country+s.status+s.notes).toLowerCase();

        if(text.includes(searchText)){

            const li=document.createElement("li");
            let paymentHistoryHTML = "";

            if(s.payments && s.payments.length > 0){
                paymentHistoryHTML = "<b>Payment History:</b><br>";
                
                s.payments.forEach(p=>{
                    paymentHistoryHTML += `
                    <div style="font-size:13px;color:#555;">
                        💰 ₹${p.amount} - 📅 ${p.date}
                    </div>
                    `;
                });
            }

            li.innerHTML=`
            <div>
                <b>${s.name}</b><br>
                📞 ${s.phone}<br>
                🌍 ${s.country}<br>
                💰 Total: ₹${s.totalFees || 0}<br>
                💵 Paid: ₹${totalPaid}<br>
                💸 Due: ₹${due}<br>
                <button onclick="addPayment(${i})">Add Payment</button><br>
                ${paymentHistoryHTML}
                🗒 ${s.notes || ""}<br>
                📅 ${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}
            </div>
            `;

            ul.appendChild(li);
        }
    });

    drawCharts();
    drawCountryChart();
}

// STUDENT CHART
function drawCharts(){

    const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let stu=new Array(12).fill(0);

    students.forEach(s=>{
        if(!s.createdAt) return;
        const m=new Date(s.createdAt).getMonth();
        stu[m]++;
    });

    if(studentsChart) studentsChart.destroy();

    studentsChart=new Chart(document.getElementById("studentsChart"),{
        type:"bar",
        data:{labels:months,datasets:[{label:"Students",data:stu}]},
        options:{responsive:true,maintainAspectRatio:false}
    });
}

// COUNTRY CHART
function drawCountryChart(){

    const map={};

    students.forEach(s=>{
        if(!s.country) return;
        map[s.country]=(map[s.country]||0)+1;
    });

    const labels=Object.keys(map);
    const data=Object.values(map);

    if(countryChart) countryChart.destroy();

    countryChart=new Chart(document.getElementById("countryChart"),{
        type:"doughnut",
        data:{labels:labels,datasets:[{data:data}]},
        options:{responsive:true,maintainAspectRatio:false}
    });
}

function clearForm(){
    document.getElementById("name").value="";
    document.getElementById("phone").value="";
    document.getElementById("country").selectedIndex=0;
    document.getElementById("fees").value="";
    document.getElementById("notes").value="";
}

function exportCSV(){
    let csv="Name,Phone,Country,TotalFees\n";
    students.forEach(s=>{
        csv+=`${s.name},${s.phone},${s.country},${s.totalFees}\n`;
    });
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="students.csv";
    a.click();
}