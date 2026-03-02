let students = [];
let studentsChart, countryChart, incomeChart;

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
        followUpDate: document.getElementById("followUp").value || null,
        notes:document.getElementById("notes").value || ""
    };

    fetch("/students",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(student)
    })
    .then(res=>res.json())
    .then(()=>{
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
        date:new Date().toISOString()
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
        const due = Math.max(0, Number(s.totalFees||0) - totalPaid);

        revenue+=totalPaid;
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
        const due = Math.max(0, Number(s.totalFees||0) - totalPaid);

        const text=(s.name+s.phone+s.country+s.status+s.notes).toLowerCase();

        if(text.includes(searchText)){

            const li=document.createElement("li");
            let paymentHistoryHTML = "";

            if(s.payments && s.payments.length > 0){
                paymentHistoryHTML = "<b>Payment History:</b><br>";
                
                s.payments.forEach(p=>{
                    paymentHistoryHTML += `
                    <div style="font-size:13px;color:#555;">
                        💰 ₹${p.amount} - 📅 ${new Date(p.date).toLocaleDateString()}
                    </div>
                    `;
                });
            }

            li.innerHTML = `
            <div>
                <b>${s.name}</b><br>
                📞 ${s.phone}<br>
                🌍 ${s.country}<br>
                📆 Follow Up: ${s.followUpDate ? new Date(s.followUpDate).toLocaleDateString() : "Not Set"}<br>
                💰 Total: ₹${s.totalFees || 0}<br>
                💵 Paid: ₹${totalPaid}<br>
                💸 Due: ₹${due}<br>

                <button onclick="addPayment(${i})">Add Payment</button><br>
                <button class="whatsapp" onclick="sendWhatsApp('${s.phone}','${s.name}')">WhatsApp</button><br>

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
    drawIncomeChart();
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

// INCOME CHART
function drawIncomeChart(){

    const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let income=new Array(12).fill(0);

    students.forEach(s=>{
        if(!s.createdAt) return;

        const m=new Date(s.createdAt).getMonth();
        const totalPaid = (s.payments || []).reduce((sum,p)=>sum+Number(p.amount||0),0);

        income[m]+=totalPaid;
    });

    if(incomeChart) incomeChart.destroy();

    incomeChart=new Chart(document.getElementById("incomeChart"),{
        type:"line",
        data:{
            labels:months,
            datasets:[{
                label:"Monthly Income",
                data:income,
                fill:false,
                tension:0.3
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

// WHATSAPP FUNCTION
function sendWhatsApp(phone,name){

    if(!phone){
        alert("Phone number not available");
        return;
    }

    phone = phone.replace(/\s+/g, '');

    let message = `Hello ${name},

This is a follow-up regarding your study abroad process.

Please contact us.

Student CRM`;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

// CLEAR FORM
function clearForm(){
    document.getElementById("name").value="";
    document.getElementById("phone").value="";
    document.getElementById("country").selectedIndex=0;
    document.getElementById("fees").value="";
    document.getElementById("notes").value="";
    document.getElementById("followUp").value="";
}

// EXPORT CSV
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