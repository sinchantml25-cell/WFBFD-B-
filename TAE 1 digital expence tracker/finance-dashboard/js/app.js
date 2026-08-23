// =========================================
// Digital Personal Finance Dashboard
// Main JavaScript File
// =========================================

// ---------- State ----------
let transactions = [];
let nextId = 1;
let editingTransactionId = null; // null = "Add" mode; a number = editing that transaction's id


// ---------- DOM Elements ----------
const transactionForm = document.getElementById("transaction-form");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const formError = document.getElementById("form-error");
const transactionTableBody = document.getElementById("transaction-table-body");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");


// ---------- Initialization ----------
function init() {
  console.log("Finance Dashboard app.js is connected and running!");
  displayTransactions();
}


// ---------- Transaction Functions ----------

function handleTransactionFormSubmit(event) {
  event.preventDefault();

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
    return;
  }

  hideFormError();

  if (editingTransactionId === null) {
    addNewTransaction(formData);
    transactionForm.reset();
  } else {
    updateTransaction(editingTransactionId, formData);
    cancelEditing(); // resets the form and switches back to "Add" mode
  }

  displayTransactions();
}

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
  return null;
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove("hidden");
}

function hideFormError() {
  formError.classList.add("hidden");
}

// Creates a brand-new transaction and adds it to the array
function addNewTransaction(formData) {
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

  // Phase 8 will add: saveTransactions();
}

// Finds an existing transaction by id and overwrites its values
function updateTransaction(id, formData) {
  const transactionToUpdate = transactions.find(function (transaction) {
    return transaction.id === id;
  });

  if (!transactionToUpdate) {
    return; // safety check — it may have been deleted mid-edit
  }

  transactionToUpdate.date = formData.date;
  transactionToUpdate.type = formData.type;
  transactionToUpdate.category = formData.category;
  transactionToUpdate.amount = formData.amount;
  transactionToUpdate.description = formData.description;

  // Phase 8 will add: saveTransactions();
}

// Loads a transaction's values into the form and switches to "edit mode"
function startEditingTransaction(id) {
  const transactionToEdit = transactions.find(function (transaction) {
    return transaction.id === id;
  });

  if (!transactionToEdit) {
    return;
  }

  dateInput.value = transactionToEdit.date;
  typeInput.value = transactionToEdit.type;
  categoryInput.value = transactionToEdit.category;
  amountInput.value = transactionToEdit.amount;
  descriptionInput.value = transactionToEdit.description;

  editingTransactionId = id;
  submitBtn.textContent = "Update Transaction";
  cancelEditBtn.classList.remove("hidden");

  transactionForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Exits edit mode and returns the form to normal "Add" mode
function cancelEditing() {
  editingTransactionId = null;
  transactionForm.reset();
  hideFormError();
  submitBtn.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
}

function displayTransactions() {
  transactionTableBody.innerHTML = "";

  if (transactions.length === 0) {
    transactionTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-slate-400 py-6">
          No transactions yet. Add one above to get started.
        </td>
      </tr>
    `;
    return;
  }

  transactions.forEach(function (transaction) {
    const rowHtml = createTransactionRow(transaction);
    transactionTableBody.insertAdjacentHTML("beforeend", rowHtml);
  });
}

function createTransactionRow(transaction) {
  const isIncome = transaction.type === "income";

  const typeBadge = isIncome
    ? `<span class="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Income</span>`
    : `<span class="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Expense</span>`;

  const amountClass = isIncome ? "text-green-600" : "text-red-600";
  const amountSign = isIncome ? "+" : "-";

  return `
    <tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 text-sm text-slate-600">${transaction.date}</td>
      <td class="px-4 py-3">${typeBadge}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${transaction.category}</td>
      <td class="px-4 py-3 text-sm font-semibold ${amountClass}">${amountSign}₹${transaction.amount.toFixed(2)}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${transaction.description}</td>
      <td class="px-4 py-3 text-sm whitespace-nowrap">
        <button class="edit-btn text-blue-600 hover:underline mr-3" data-id="${transaction.id}">Edit</button>
        <button class="delete-btn text-red-600 hover:underline" data-id="${transaction.id}">Delete</button>
      </td>
    </tr>
  `;
}

// Handles clicks anywhere inside the transaction table (event delegation)
function handleTransactionTableClick(event) {
  const clickedElement = event.target;

  if (clickedElement.classList.contains("delete-btn")) {
    const transactionId = Number(clickedElement.dataset.id);
    deleteTransaction(transactionId);
  } else if (clickedElement.classList.contains("edit-btn")) {
    const transactionId = Number(clickedElement.dataset.id);
    startEditingTransaction(transactionId);
  }
}

function deleteTransaction(id) {
  const confirmed = confirm("Are you sure you want to delete this transaction?");

  if (!confirmed) {
    return;
  }

  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });

  displayTransactions();

  // Phase 7 will add: updateDashboard();
  // Phase 8 will add: saveTransactions();
  // Phase 10 will add: updateExpenseChart();
}


// ---------- Event Listeners ----------
transactionForm.addEventListener("submit", handleTransactionFormSubmit);
transactionTableBody.addEventListener("click", handleTransactionTableClick);
cancelEditBtn.addEventListener("click", cancelEditing);
document.addEventListener("DOMContentLoaded", init);