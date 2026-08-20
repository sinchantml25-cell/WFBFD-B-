mini project
# Digital Personal Finance Dashboard

This is my mini project for TAE-1, built to help track day-to-day income and expenses without needing a spreadsheet or a banking app. It's a fully client-side dashboard — everything runs in the browser, no backend or database involved.

Still being built out. Right now the dashboard layout and the Add Transaction form are working; the rest is coming together phase by phase.

## What it does (or will do)

- Add income and expense transactions with a category and description
- See totals for income, expenses, balance, and savings rate update automatically
- View, edit, and delete transactions from a table
- Set savings goals and track progress toward them
- Break down spending by category in a chart
- Search and filter through transactions
- Keep everything saved in the browser (LocalStorage), so it's still there after a refresh
- Works on both desktop and mobile

Right now, only the dashboard cards and the Add Transaction form are functional — the rest is being added over the next couple of days.

## Built with

- HTML5
- Tailwind CSS
- Vanilla JavaScript (no frameworks)
- Chart.js for the spending chart
- Browser LocalStorage for saving data
- Deployed with GitHub Pages

Kept intentionally simple and framework-free since this is meant to be a project I can explain line-by-line during the viva.

## Folder structure

```text
digital-personal-finance-dashboard/
│
├── finance-dashboard/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── assets/
│
└── README.md
```

## Running it locally

Just open `finance-dashboard/index.html` in a browser — that's it, no installation needed.

If you have VS Code, using the Live Server extension is a bit nicer since it auto-refreshes whenever a file is saved.

## Screenshots

Adding these once the UI is further along.

## Live demo

Will be linked here once it's deployed on GitHub Pages.

## About

Built by [your name] as part of the [your course/subject name] mini project.