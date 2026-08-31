// =========================================
// Digital Personal Finance Dashboard
// Main JavaScript File
// =========================================

// ---------- State ----------
let transactions = [];
let nextId = 1;
let editingTransactionId = null;

let savingsGoals = [];
let nextGoalId = 1;
let editingGoalId = null;

let expenseChart = null;

let searchQuery = "";     // current search text, always stored lowercase
let currentFilter = "all"; // "all" | "income" | "expense"


// ---------- DOM Elements ----------

// Transaction form
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

// Search and filter
const searchInput = document.getElementById("search-input");
const filterTypeSelect = document.getElementById("filter-type");

// Dashboard cards
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const currentBalanceEl = document.getElementById("current-balance");
const savingsRateEl = document.getElementById("savings-rate");

// Savings goals
const goalForm = document.getElementById("goal-form");
const goalNameInput = document.getElementById("goal-name");
const goalTargetInput = document.getElementById("goal-target");
const goalSavedInput = document.getElementById("goal-saved");
const goalFormError = document.getElementById("goal-form-error");
const goalSubmitBtn = document.getElementById("goal-submit-btn");
const goalCancelBtn = document.getElementById("goal-cancel-btn");
const goalsList = document.getElementById("goals-list");

// Expense chart
const expenseChartCanvas = document.getElementById("expense-chart");
const chartEmptyMessage = document.getElementById("chart-empty-message");


// ---------- Initialization ----------
function init() {
  console.log("Finance Dashboard app.js is connected and running!");

  loadTransactions();
  loadSavingsGoals();

  refreshUI();
  displaySavingsGoals();
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
    cancelEditing();
  }

  refreshUI();
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

  saveTransactions();
}

function updateTransaction(id, formData) {
  const transactionToUpdate = transactions.find(function (transaction) {
    return transaction.id === id;
  });

  if (!transactionToUpdate) {
    return;
  }

  transactionToUpdate.date = formData.date;
  transactionToUpdate.type = formData.type;
  transactionToUpdate.category = formData.category;
  transactionToUpdate.amount = formData.amount;
  transactionToUpdate.description = formData.description;

  saveTransactions();
}

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

function cancelEditing() {
  editingTransactionId = null;
  transactionForm.reset();
  hideFormError();
  submitBtn.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
}

// Redraws the table using only the transactions that match the
// current search text and filter type
function displayTransactions() {
  transactionTableBody.innerHTML = "";

  const visibleTransactions = getVisibleTransactions();

  if (visibleTransactions.length === 0) {
    const message = transactions.length === 0
      ? "No transactions yet. Add one above to get started."
      : "No transactions match your search or filter.";

    transactionTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-slate-400 py-6">${message}</td>
      </tr>
    `;
    return;
  }

  visibleTransactions.forEach(function (transaction) {
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

  refreshUI();
  saveTransactions();
}


// ---------- Dashboard Calculations ----------
// NOTE: these intentionally always use the full `transactions` array,
// never the filtered/searched subset — totals should reflect everything.

function calculateIncome() {
  let total = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      total += transaction.amount;
    }
  });

  return total;
}

function calculateExpenses() {
  let total = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "expense") {
      total += transaction.amount;
    }
  });

  return total;
}

function calculateBalance() {
  return calculateIncome() - calculateExpenses();
}

function calculateSavingsRate() {
  const income = calculateIncome();
  const expenses = calculateExpenses();

  if (income === 0) {
    return 0;
  }

  return ((income - expenses) / income) * 100;
}

function updateDashboard() {
  const income = calculateIncome();
  const expenses = calculateExpenses();
  const balance = calculateBalance();
  const savingsRate = calculateSavingsRate();

  totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
  totalExpensesEl.textContent = `₹${expenses.toFixed(2)}`;
  currentBalanceEl.textContent = `₹${balance.toFixed(2)}`;
  savingsRateEl.textContent = `${savingsRate.toFixed(1)}%`;
}

function refreshUI() {
  displayTransactions();
  updateDashboard();
  updateExpenseChart();
}


// ---------- Savings Goal Functions ----------

function handleGoalFormSubmit(event) {
  event.preventDefault();

  const formData = {
    name: goalNameInput.value.trim(),
    target: parseFloat(goalTargetInput.value),
    saved: parseFloat(goalSavedInput.value)
  };

  const errorMessage = validateGoalForm(formData);

  if (errorMessage) {
    showGoalFormError(errorMessage);
    return;
  }

  hideGoalFormError();

  if (editingGoalId === null) {
    addSavingsGoal(formData);
    goalForm.reset();
  } else {
    updateGoal(editingGoalId, formData);
    cancelEditingGoal();
  }

  displaySavingsGoals();
  saveSavingsGoals();
}

function validateGoalForm(data) {
  if (!data.name) {
    return "Please enter a goal name.";
  }
  if (isNaN(data.target) || data.target <= 0) {
    return "Target amount must be greater than zero.";
  }
  if (isNaN(data.saved) || data.saved < 0) {
    return "Saved amount cannot be negative.";
  }
  return null;
}

function showGoalFormError(message) {
  goalFormError.textContent = message;
  goalFormError.classList.remove("hidden");
}

function hideGoalFormError() {
  goalFormError.classList.add("hidden");
}

function addSavingsGoal(formData) {
  const newGoal = {
    id: nextGoalId,
    name: formData.name,
    target: formData.target,
    saved: formData.saved
  };

  nextGoalId++;
  savingsGoals.push(newGoal);
}

function updateGoal(id, formData) {
  const goalToUpdate = savingsGoals.find(function (goal) {
    return goal.id === id;
  });

  if (!goalToUpdate) {
    return;
  }

  goalToUpdate.name = formData.name;
  goalToUpdate.target = formData.target;
  goalToUpdate.saved = formData.saved;
}

function editSavingsGoal(id) {
  const goalToEdit = savingsGoals.find(function (goal) {
    return goal.id === id;
  });

  if (!goalToEdit) {
    return;
  }

  goalNameInput.value = goalToEdit.name;
  goalTargetInput.value = goalToEdit.target;
  goalSavedInput.value = goalToEdit.saved;

  editingGoalId = id;
  goalSubmitBtn.textContent = "Update Goal";
  goalCancelBtn.classList.remove("hidden");

  goalForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cancelEditingGoal() {
  editingGoalId = null;
  goalForm.reset();
  hideGoalFormError();
  goalSubmitBtn.textContent = "Add Goal";
  goalCancelBtn.classList.add("hidden");
}

function deleteSavingsGoal(id) {
  const confirmed = confirm("Are you sure you want to delete this savings goal?");

  if (!confirmed) {
    return;
  }

  savingsGoals = savingsGoals.filter(function (goal) {
    return goal.id !== id;
  });

  displaySavingsGoals();
  saveSavingsGoals();
}

function calculateGoalProgress(goal) {
  if (goal.target === 0) {
    return 0;
  }

  const rawProgress = (goal.saved / goal.target) * 100;
  return Math.min(rawProgress, 100);
}

function calculateGoalRemaining(goal) {
  const remaining = goal.target - goal.saved;
  return remaining > 0 ? remaining : 0;
}

function displaySavingsGoals() {
  goalsList.innerHTML = "";

  if (savingsGoals.length === 0) {
    goalsList.innerHTML = `
      <p class="text-slate-400 text-center py-6 sm:col-span-2">
        No savings goals yet. Add one above to start tracking.
      </p>
    `;
    return;
  }

  savingsGoals.forEach(function (goal) {
    const cardHtml = createGoalCard(goal);
    goalsList.insertAdjacentHTML("beforeend", cardHtml);
  });
}

function createGoalCard(goal) {
  const progress = calculateGoalProgress(goal);
  const remaining = calculateGoalRemaining(goal);
  const isComplete = goal.saved >= goal.target;

  return `
    <div class="border border-slate-200 rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-slate-800">${goal.name}</h3>
        ${isComplete ? '<span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">Goal reached!</span>' : ""}
      </div>

      <p class="text-sm text-slate-500 mb-2">₹${goal.saved.toFixed(2)} / ₹${goal.target.toFixed(2)}</p>

      <div class="w-full bg-slate-200 rounded-full h-3 mb-2">
        <div class="bg-emerald-500 h-3 rounded-full" style="width: ${progress}%"></div>
      </div>

      <p class="text-xs text-slate-500 mb-3">${progress.toFixed(0)}% complete &middot; ₹${remaining.toFixed(2)} remaining</p>

      <div class="text-sm">
        <button class="goal-edit-btn text-blue-600 hover:underline mr-3" data-id="${goal.id}">Edit</button>
        <button class="goal-delete-btn text-red-600 hover:underline" data-id="${goal.id}">Delete</button>
      </div>
    </div>
  `;
}

function handleGoalsListClick(event) {
  const clickedElement = event.target;

  if (clickedElement.classList.contains("goal-delete-btn")) {
    const goalId = Number(clickedElement.dataset.id);
    deleteSavingsGoal(goalId);
  } else if (clickedElement.classList.contains("goal-edit-btn")) {
    const goalId = Number(clickedElement.dataset.id);
    editSavingsGoal(goalId);
  }
}


// ---------- LocalStorage Functions ----------

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const storedTransactions = localStorage.getItem("transactions");

  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
  }

  if (transactions.length > 0) {
    const existingIds = transactions.map(function (transaction) {
      return transaction.id;
    });
    nextId = Math.max(...existingIds) + 1;
  }
}

function saveSavingsGoals() {
  localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
}

function loadSavingsGoals() {
  const storedGoals = localStorage.getItem("savingsGoals");

  if (storedGoals) {
    savingsGoals = JSON.parse(storedGoals);
  }

  if (savingsGoals.length > 0) {
    const existingIds = savingsGoals.map(function (goal) {
      return goal.id;
    });
    nextGoalId = Math.max(...existingIds) + 1;
  }
}


// ---------- Chart Functions ----------

function calculateCategoryTotals() {
  const totals = {};

  transactions.forEach(function (transaction) {
    if (transaction.type === "expense") {
      const category = transaction.category;

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += transaction.amount;
    }
  });

  return totals;
}

function updateExpenseChart() {
  const categoryTotals = calculateCategoryTotals();
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
    expenseChart = null;
  }

  if (labels.length === 0) {
    expenseChartCanvas.classList.add("hidden");
    chartEmptyMessage.classList.remove("hidden");
    return;
  }

  expenseChartCanvas.classList.remove("hidden");
  chartEmptyMessage.classList.add("hidden");

  expenseChart = new Chart(expenseChartCanvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#f97316", "#3b82f6", "#a855f7", "#ef4444",
          "#22c55e", "#eab308", "#64748b", "#ec4899"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}


// ---------- Search and Filter Functions ----------

// Keeps only transactions matching the current type filter ("all" keeps everything)
function filterTransactions(transactionsList) {
  if (currentFilter === "all") {
    return transactionsList;
  }

  return transactionsList.filter(function (transaction) {
    return transaction.type === currentFilter;
  });
}

// Keeps only transactions whose category or description contains the search text
function searchTransactions(transactionsList) {
  if (searchQuery === "") {
    return transactionsList;
  }

  return transactionsList.filter(function (transaction) {
    const category = transaction.category.toLowerCase();
    const description = transaction.description.toLowerCase();
    return category.includes(searchQuery) || description.includes(searchQuery);
  });
}

// Combines both: filter by type first, then search within that result
function getVisibleTransactions() {
  const filtered = filterTransactions(transactions);
  return searchTransactions(filtered);
}

function handleSearchInput(event) {
  searchQuery = event.target.value.trim().toLowerCase();
  displayTransactions();
}

function handleFilterChange(event) {
  currentFilter = event.target.value;
  displayTransactions();
}


// ---------- Event Listeners ----------
transactionForm.addEventListener("submit", handleTransactionFormSubmit);
transactionTableBody.addEventListener("click", handleTransactionTableClick);
cancelEditBtn.addEventListener("click", cancelEditing);
searchInput.addEventListener("input", handleSearchInput);
filterTypeSelect.addEventListener("change", handleFilterChange);

goalForm.addEventListener("submit", handleGoalFormSubmit);
goalsList.addEventListener("click", handleGoalsListClick);
goalCancelBtn.addEventListener("click", cancelEditingGoal);

document.addEventListener("DOMContentLoaded", init);