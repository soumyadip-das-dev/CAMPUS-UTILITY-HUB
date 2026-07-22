
// ARRAYS

let attendanceArray = [];
let subjects = [];
let expenses = [];
let quizQuestions = [];
let paragraphs = [];


// ATTENDANCE TRACKER

const attendanceTable = document.getElementById("attendanceTable");

function addAttendanceRecord() {

  let name = document.getElementById("studentName").value;
  let status = document.getElementById("attendanceStatus").value;

  let attendance = status === "Present"
    ? 100
    : status === "Late"
    ? 75
    : 0;

  attendanceArray.push({
    name,
    status,
    attendance
  });

  renderAttendance();
}

function renderAttendance() {

  attendanceTable.innerHTML = "";

  attendanceArray.forEach(student => {

    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.status}</td>
      <td>${student.attendance}%</td>
    `;

    attendanceTable.appendChild(row);
  });
}


document
  .getElementById("addAttendance")
  .addEventListener("click", addAttendanceRecord);


// CGPA CALCULATOR

const gradePoints = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5
};

function addSubjectData() {

  let name = document.getElementById("subjectName").value;
  let credits = Number(document.getElementById("credits").value);
  let grade = document.getElementById("grade").value;

  subjects.push({
    name,
    credits,
    grade
  });

  calculateSGPA();
}

function calculateSGPA() {

  let totalCredits = 0;
  let weightedSum = 0;

  for(let i = 0; i < subjects.length; i++) {

    totalCredits += subjects[i].credits;

    weightedSum += subjects[i].credits * gradePoints[subjects[i].grade];
  }

  let sgpa = weightedSum / totalCredits;

  document.getElementById("cgpaResult").innerHTML = `
    <h4>SGPA: ${sgpa.toFixed(2)}</h4>
  `;
}


document
  .getElementById("addSubject")
  .addEventListener("click", addSubjectData);


// NUMBER CONVERTER

function decimalToBinary(num) {

  let binary = "";

  while(num > 0) {

    binary = (num % 2) + binary;
    num = Math.floor(num / 2);
  }

  return binary;
}

function convertNumber() {

  let num = Number(document.getElementById("decimalInput").value);

  let binary = decimalToBinary(num);

  document.getElementById("converterResult").innerHTML = `
    <p>Binary: ${binary}</p>
  `;
}


document
  .getElementById("convertBtn")
  .addEventListener("click", convertNumber);


// PASSWORD ANALYZER

function analyzePassword() {

  let password = document.getElementById("passwordInput").value;

  let strength = 0;

  if(/[A-Z]/.test(password)) strength++;
  if(/[a-z]/.test(password)) strength++;
  if(/[0-9]/.test(password)) strength++;
  if(/[!@#$%^&*]/.test(password)) strength++;
  if(password.length >= 8) strength++;

  let meter = document.getElementById("meter");
  let text = document.getElementById("strengthText");

  if(strength <= 2) {
    meter.style.width = "30%";
    text.innerText = "Weak";
  }

  else if(strength <= 4) {
    meter.style.width = "70%";
    text.innerText = "Medium";
  }

  else {
    meter.style.width = "100%";
    text.innerText = "Strong";
  }
}


document
  .getElementById("passwordInput")
  .addEventListener("input", analyzePassword);


// QUIZ SYSTEM

quizQuestions = [
  {
    question: "What is HTML?",
    options: ["Language", "Database", "OS", "Browser"],
    answer: "Language"
  }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {

  let q = quizQuestions[currentQuestion];

  document.getElementById("quizQuestion").innerText = q.question;

  let optionsDiv = document.getElementById("quizOptions");

  optionsDiv.innerHTML = "";

  q.options.forEach(option => {

    let btn = document.createElement("button");

    btn.innerText = option;

    btn.addEventListener("click", () => checkAnswer(option));

    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(option) {

  if(option === quizQuestions[currentQuestion].answer) {
    score++;
  }
}

showQuestion();


// EXPENSE SPLITTER

function addExpenseData() {

  let name = document.getElementById("personName").value;
  let amount = Number(document.getElementById("expenseAmount").value);

  expenses.push({
    name,
    amount
  });

  calculateExpense();
}

function calculateExpense() {

  let total = 0;

  expenses.forEach(exp => {
    total += exp.amount;
  });

  let share = total / expenses.length;

  document.getElementById("expenseResult").innerHTML = `
    <p>Total Expense: ₹${total}</p>
    <p>Individual Share: ₹${share.toFixed(2)}</p>
  `;
}


document
  .getElementById("addExpense")
  .addEventListener("click", addExpenseData);


// THEME GENERATOR

function updateTheme() {

  let bg = document.getElementById("bgColor").value;

  document.body.style.background = bg;
}


document
  .getElementById("bgColor")
  .addEventListener("input", updateTheme);


// TYPING TESTER

paragraphs = [
  "JavaScript is the language of the web."
];

let randomParagraph = paragraphs[0];


document.getElementById("typingParagraph").innerText = randomParagraph;


// DARK MODE


document
  .getElementById("darkBtn")
  .addEventListener("click", () => {

    document.body.classList.toggle("dark");
  });