// =========================================
// Digital Personal Finance Dashboard
// Main JavaScript File
// =========================================

// ---------- State ----------
let transactions = [];   // will hold all transaction objects
let nextId = 1;           // simple counter to give each transaction a unique id


// ---------- DOM Elements ----------
const transactionForm = document.getElementById("transaction-form");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const formError = document.getElementById("form-error");


// ---------- Initialization ----------
function init() {
  console.log("Finance Dashboard app.js is connected and running!");
}


// ---------- Transaction Functions ----------

// Runs when the Add Transaction form is submitted
function handleTransactionFormSubmit(event) {
  event.preventDefault(); // stop the browser's default page-reload behaviour

  const formData = {
    date: dateInput.value,
    type: typeInput.value,
    category: categoryInput.value,
    amount: parseFloat(amountInput.value),
    description: descriptionInput.value.trim()
  };

  const errorMessage = validateTransactionForm(formData);

  if (errorMessage) {
    showFormError(errorMessage);
    return; // stop here — do not add an invalid transaction
  }

  hideFormError();

  const newTransaction = {
    id: nextId,
    date: formData.date,
    type: formData.type,
    category: formData.category,
    amount: formData.amount,
    description: formData.description
  };

  nextId++;
  transactions.push(newTransaction);

  // Temporary check — Phase 4 will display this in a real table on the page
  console.log("Transactions so far:", transactions);

  transactionForm.reset();
}

// Checks the form data. Returns an error message string if something
// is wrong, or null if the data is valid.
function validateTransactionForm(data) {
  if (!data.date) {
    return "Please select a date.";
  }
  if (!data.type) {
    return "Please select a type (Income or Expense).";
  }
  if (!data.category) {
    return "Please select a category.";
  }
  if (isNaN(data.amount) || data.amount <= 0) {
    return "Amount must be a number greater than zero.";
  }
  return null; // no errors found
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove("hidden");
}

function hideFormError() {
  formError.classList.add("hidden");
}


// ---------- Event Listeners ----------
transactionForm.addEventListener("submit", handleTransactionFormSubmit);
document.addEventListener("DOMContentLoaded", init);