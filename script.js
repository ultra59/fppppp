// ================== АКТИВНЫЙ ПУНКТ НАВБАРА ==================
document.addEventListener("DOMContentLoaded", () => {
    const current = document.body.dataset.page;
    const items = document.querySelectorAll(".nav-item");

    items.forEach(item => {
        if (item.dataset.page === current) {
            item.classList.add("active");
        }
    });

    // Рендер страниц
    renderHome();
    renderAccounts();
    renderCategories();
    renderGoals();
    renderAnalytics();
    renderTransactions();
});

// ================== ДАННЫЕ (localStorage, но статично) ==================
if (!localStorage.getItem("financeData")) {
    const data = {
        accounts: [
            { id: 1, name: "Текущий зарплатный счёт", bank: "Банк 1", balance: 1000000, color: "blue" },
            { id: 2, name: "Накопительный счёт", bank: "Банк 2", balance: 350000, color: "green" },
            { id: 3, name: "Карта для покупок", bank: "Банк 3", balance: 42000, color: "yellow" }
        ],

        categories: [
            { id: 1, name: "Продукты", color: "green", percent: 12, amount: 12000 },
            { id: 2, name: "Транспорт", color: "blue", percent: 9, amount: 8640 },
            { id: 3, name: "Развлечения", color: "yellow", percent: 2, amount: 2000 },
            { id: 4, name: "Жильё", color: "purple", percent: 37, amount: 32000 },
            { id: 5, name: "Рестораны", color: "red", percent: 40, amount: 34000 }
        ],

        goals: [
            { id: 1, name: "Отпуск", current: 75000, target: 100000 },
            { id: 2, name: "Новый телефон", current: 20000, target: 50000 },
            { id: 3, name: "Подушка безопасности", current: 10000, target: 100000 }
        ],

        transactions: [
            { id: 1, title: "Продукты", account: "Тинькофф", amount: -1460, date: "2026-06-22", category: "Продукты", color: "red" },
            { id: 2, title: "Зарплата", account: "Тинькофф", amount: 70000, date: "2026-06-22", category: "Зарплата", color: "green" },
            { id: 3, title: "Транспорт", account: "Сбербанк", amount: -320, date: "2026-06-21", category: "Транспорт", color: "blue" },
            { id: 4, title: "Развлечения", account: "Альфа", amount: -1200, date: "2026-06-21", category: "Развлечения", color: "yellow" }
        ]
    };

    localStorage.setItem("financeData", JSON.stringify(data));
}

function getData() {
    return JSON.parse(localStorage.getItem("financeData"));
}

// ================== НАСТРОЙКИ CHART.JS (ТОЛЬКО НА АНАЛИТИКЕ) ==================
let chartColors = null;

if (typeof Chart !== "undefined") {
    Chart.defaults.font.family = "Inter";
    Chart.defaults.font.size = 14;
    Chart.defaults.color = "#7A7A7A";

    Chart.defaults.plugins.legend.display = false;

    Chart.defaults.elements.bar.borderRadius = 12;
    Chart.defaults.elements.line.tension = 0.35;

    Chart.defaults.scales.linear.grid.display = false;
    Chart.defaults.scales.category.grid.display = false;

    Chart.defaults.scales.linear.border = { display: false };
    Chart.defaults.scales.category.border = { display: false };

    chartColors = {
        blue: getComputedStyle(document.documentElement).getPropertyValue("--blue").trim(),
        green: getComputedStyle(document.documentElement).getPropertyValue("--green").trim(),
        yellow: getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim(),
        red: getComputedStyle(document.documentElement).getPropertyValue("--red").trim(),
        purple: getComputedStyle(document.documentElement).getPropertyValue("--purple").trim()
    };
}

// ================== ГЛАВНАЯ СТРАНИЦА ==================
function renderHome() {
    if (document.body.dataset.page !== "home") return;

    const db = getData();

    // Общий баланс
    const totalBalance = db.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const balanceEl = document.querySelector(".balance-value");
    if (balanceEl) balanceEl.textContent = totalBalance.toLocaleString() + " ₽";

    // Доходы
    const totalIncome = db.transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const incomeValueEl = document.querySelector(".income .value");
    if (incomeValueEl) incomeValueEl.textContent = "+" + totalIncome.toLocaleString() + " ₽";

    // Расходы
    const totalExpense = db.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expenseValueEl = document.querySelector(".expense .value");
    if (expenseValueEl) expenseValueEl.textContent = "-" + totalExpense.toLocaleString() + " ₽";

    // Проценты (условные, как заглушка)
    const incomePercentEl = document.querySelector(".income .percent");
    if (incomePercentEl) incomePercentEl.textContent = "+12%";

    const expensePercentEl = document.querySelector(".expense .percent");
    if (expensePercentEl) expensePercentEl.textContent = "-4%";

    // План расходов
    const planLimit = 100000;
    const planUsed = totalExpense;
    const planPercent = Math.min(100, Math.round(planUsed / planLimit * 100));

    const planFillEl = document.querySelector(".plan-fill");
    if (planFillEl) planFillEl.style.width = planPercent + "%";

    const planTextEl = document.querySelector(".plan-text");
    if (planTextEl) {
        planTextEl.textContent =
            `${planUsed.toLocaleString()} / ${planLimit.toLocaleString()} ₽ — ${planPercent}%`;
    }

    // Краткие счета
    const accShort = document.querySelector(".accounts-short");
    if (accShort) {
        accShort.innerHTML = "";
        db.accounts.slice(0, 3).forEach(acc => {
            accShort.innerHTML += `
                <div class="account-card">
                    <div class="acc-icon ${acc.color}"></div>
                    <div class="account-info">
                        <div class="acc-title">${acc.name}</div>
                        <div class="acc-bank">${acc.bank}</div>
                    </div>
                    <div class="acc-value">${acc.balance.toLocaleString()} ₽</div>
                </div>
            `;
        });
    }

    // Категории (кратко, карточками)
    const catList = document.querySelector(".categories-list");
    if (catList) {
        catList.innerHTML = "";
        db.categories.forEach(cat => {
            catList.innerHTML += `
                <div class="category-card">
                    <div class="category-left">
                        <div class="category-icon ${cat.color}"></div>
                        <div class="category-info">
                            <div class="category-title">${cat.name}</div>
                            <div class="category-percent">
                                ${cat.amount.toLocaleString()} ₽ (${cat.percent}%)
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Цели (кратко)
    const goalsList = document.querySelector(".goals-list");
    if (goalsList) {
        goalsList.innerHTML = "";
        db.goals.forEach(goal => {
            const percent = Math.round(goal.current / goal.target * 100);
            goalsList.innerHTML += `
                <div class="goal-card">
                    <div class="goal-title">${goal.name}</div>
                    <div class="goal-progress">
                        <div class="goal-fill" style="width: ${percent}%;"></div>
                    </div>
                    <div class="goal-text">
                        ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} ₽ — ${percent}%
                    </div>
                </div>
            `;
        });
    }

    // Последние транзакции (карточками)
    const lastList = document.querySelector(".transactions-list");
    if (lastList) {
        lastList.innerHTML = "";
        const sorted = [...db.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.slice(0, 4).forEach(tr => {
            lastList.innerHTML += `
                <div class="transaction-card">
                    <div class="transaction-left">
                        <div class="transaction-icon ${tr.color}"></div>
                        <div class="transaction-info">
                            <div class="transaction-title">${tr.title}</div>
                            <div class="transaction-subtitle">${tr.account}</div>
                        </div>
                    </div>
                    <div class="transaction-amount ${tr.amount > 0 ? "green" : "red"}">
                        ${tr.amount > 0 ? "+" : ""}${tr.amount.toLocaleString()} ₽
                    </div>
                </div>
            `;
        });
    }
}

// ================== СТРАНИЦА СЧЕТА ==================
function renderAccounts() {
    if (document.body.dataset.page !== "accounts") return;

    const db = getData();
    const container = document.querySelector(".accounts-list");
    if (!container) return;

    container.innerHTML = "";
    db.accounts.forEach(acc => {
        container.innerHTML += `
            <div class="account-card">
                <div class="acc-icon ${acc.color}"></div>
                <div class="account-info">
                    <div class="acc-title">${acc.name}</div>
                    <div class="acc-bank">${acc.bank}</div>
                </div>
                <div class="acc-value">${acc.balance.toLocaleString()} ₽</div>
            </div>
        `;
    });
}

// ================== СТРАНИЦА КАТЕГОРИИ ==================
function renderCategories() {
    if (document.body.dataset.page !== "categories") return;

    const db = getData();
    const container = document.querySelector(".categories-list");
    if (!container) return;

    container.innerHTML = "";
    db.categories.forEach(cat => {
        container.innerHTML += `
            <div class="category-card">
                <div class="category-left">
                    <div class="category-icon ${cat.color}"></div>
                    <div class="category-info">
                        <div class="category-title">${cat.name}</div>
                        <div class="category-percent">
                            ${cat.amount.toLocaleString()} ₽ (${cat.percent}%)
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// ================== СТРАНИЦА ЦЕЛИ (та же страница categories) ==================
function renderGoals() {
    if (document.body.dataset.page !== "categories") return;

    const db = getData();
    const container = document.querySelector(".goals-list");
    if (!container) return;

    container.innerHTML = "";
    db.goals.forEach(goal => {
        const percent = Math.round(goal.current / goal.target * 100);
        container.innerHTML += `
            <div class="goal-card">
                <div class="goal-title">${goal.name}</div>
                <div class="goal-progress">
                    <div class="goal-fill" style="width: ${percent}%;"></div>
                </div>
                <div class="goal-text">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} ₽ — ${percent}%
                </div>
            </div>
        `;
    });
}

// ================== СТРАНИЦА АНАЛИТИКА ==================
function renderAnalytics() {
    if (document.body.dataset.page !== "analytics") return;

    const db = getData();

    // Таблица категорий
    const table = document.querySelector(".analytics-table");
    if (table) {
        table.innerHTML = `
            <tr>
                <th>Категория</th>
                <th>Сумма</th>
            </tr>
        `;
        db.categories.forEach(cat => {
            table.innerHTML += `
                <tr>
                    <td>
                        ${cat.name}
                        <div class="cat-progress">
                            <div class="cat-fill ${cat.color}" style="width: ${cat.percent}%;"></div>
                        </div>
                    </td>
                    <td>${cat.amount.toLocaleString()} ₽</td>
                </tr>
            `;
        });
    }

    // Статистика
    const income = db.transactions
        .filter(t => t.amount > 0)
        .reduce((s, t) => s + t.amount, 0);
    const expense = db.transactions
        .filter(t => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0);

    const stats = document.querySelector(".stats-grid");
    if (stats) {
        const avgExpense = Math.round(expense / 30);
        const avgIncome = Math.round(income / 30);

        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-title">Всего доходов</div>
                <div class="stat-value">${income.toLocaleString()} ₽</div>
            </div>

            <div class="stat-card">
                <div class="stat-title">Всего расходов</div>
                <div class="stat-value">${expense.toLocaleString()} ₽</div>
            </div>

            <div class="stat-card">
                <div class="stat-title">Средний расход</div>
                <div class="stat-value">${avgExpense.toLocaleString()} ₽</div>
            </div>

            <div class="stat-card">
                <div class="stat-title">Средний доход</div>
                <div class="stat-value">${avgIncome.toLocaleString()} ₽</div>
            </div>
        `;
    }

    // Графики по месяцам (вариант A уже реализован в analytics.html)
    // Здесь ничего не трогаем, чтобы не дублировать.
}

// ================== СТРАНИЦА ТРАНЗАКЦИИ ==================
function renderTransactions() {
    if (document.body.dataset.page !== "transactions") return;

    const db = getData();
    const page = document.querySelector(".page-content");
    if (!page) return;

    // Удаляем старые разделители и списки
    page.querySelectorAll(".date-divider, .transactions-list").forEach(el => el.remove());

    // Группируем по дате
    const byDate = {};
    db.transactions.forEach(tr => {
        if (!byDate[tr.date]) byDate[tr.date] = [];
        byDate[tr.date].push(tr);
    });

    const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));

    dates.forEach(date => {
        const divider = document.createElement("div");
        divider.className = "date-divider";

        const today = "2026-06-22";
        const yesterday = "2026-06-21";

        if (date === today) divider.textContent = "Сегодня";
        else if (date === yesterday) divider.textContent = "Вчера";
        else divider.textContent = date;

        page.appendChild(divider);

        const section = document.createElement("section");
        section.className = "transactions-list";

        byDate[date].forEach(tr => {
            section.innerHTML += `
                <div class="transaction-card">
                    <div class="transaction-left">
                        <div class="transaction-icon ${tr.color}"></div>
                        <div class="transaction-info">
                            <div class="transaction-title">${tr.title}</div>
                            <div class="transaction-subtitle">${tr.account}</div>
                        </div>
                    </div>
                    <div class="transaction-amount ${tr.amount > 0 ? "green" : "red"}">
                        ${tr.amount > 0 ? "+" : ""}${tr.amount.toLocaleString()} ₽
                    </div>
                </div>
            `;
        });

        page.appendChild(section);
    });
}
