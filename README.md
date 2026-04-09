# ScalerBank — Digital Banking Platform

A full-stack, cloud-native digital banking web application built with **React + Vite** (frontend) and **Node.js + Express + SQLite** (backend).

## Features

### Core Banking
- **Double-entry ledger** — Every transfer creates balanced DEBIT/CREDIT entries
- **P2P transfers** — Send money between accounts with saga pattern (auto-rollback on failure)
- **Bill payments** — Pay utility bills with categorized tracking
- **Multi-currency accounts** — INR, USD, EUR, GBP with FX conversion
- **Idempotency** — Duplicate transfer prevention via unique keys

### User Management
- **JWT authentication** — Secure register/login flow
- **KYC verification** — Aadhaar + PAN identity verification
- **MFA toggle** — Multi-factor authentication support
- **Role-based access** — Customer, Support Agent, Admin roles

### Financial Insights
- **Spending analytics** — Category-wise breakdown with pie charts
- **Daily/monthly trends** — Area and bar charts showing spending vs income
- **Savings goals** — Virtual vaults with progress tracking and deposits
- **Transaction history** — Filterable by category and type

### Infrastructure
- **Event-driven notifications** — In-app alerts for transfers, KYC, goals
- **Audit logging** — Compliance trail for all user actions
- **FX rates** — Live currency conversion with rate table
- **Beneficiaries** — Saved payees for quick transfers

---

## Tech Stack

| Layer        | Technology                          |
|------------- |-------------------------------------|
| Frontend     | React 19, Vite, Recharts            |
| Backend      | Node.js, Express 5                  |
| Database     | SQLite (via sql.js)                 |
| Auth         | JWT (jsonwebtoken), bcryptjs        |
| Styling      | CSS (DM Sans + JetBrains Mono)      |

---

## Getting Started

### Prerequisites
- **Node.js** v18+ installed

### 1. Install dependencies

```bash
# From the project root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend

```bash
cd backend
node server.js
# → API running on http://localhost:3001
```

### 3. Start the frontend (dev mode)

```bash
cd frontend
npx vite
# → App running on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the backend on port 3001.

### 4. Production build

```bash
cd frontend && npx vite build
# Then serve everything from the backend:
cd ../backend && node server.js
# → Full app on http://localhost:3001
```

---

## Project Structure

```
scalerbank/
├── package.json                    # Root scripts
│
├── backend/
│   ├── package.json                # express, sql.js, bcryptjs, jsonwebtoken, cors, uuid
│   ├── server.js                   # Express entry — mounts routes, serves static frontend
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── models/
│   │   └── database.js             # SQLite init, 10 tables, seeding, FX rates
│   ├── routes/
│   │   ├── auth.js                 # Register, login, profile, KYC, MFA
│   │   ├── accounts.js             # CRUD accounts, multi-currency, ledger
│   │   ├── transactions.js         # P2P transfer (saga), bill payment, double-entry
│   │   ├── analytics.js            # Spending by category, daily trend, monthly
│   │   └── services.js             # Goals, notifications, FX, beneficiaries, audit
│   └── utils/
│
├── frontend/
│   ├── package.json                # react, react-dom, recharts, vite
│   ├── vite.config.js              # Vite config with API proxy
│   ├── index.html                  # SPA entry point
│   └── src/
│       ├── main.jsx                # React DOM root mount
│       ├── App.jsx                 # Auth context, routing shell, sidebar, global CSS
│       ├── hooks/
│       │   └── useAuth.jsx         # Auth context provider (login, register, apiFetch)
│       ├── utils/
│       │   └── constants.js        # Formatters, category icons/colors, API base
│       └── pages/
│           ├── LoginPage.jsx       # Login form
│           ├── RegisterPage.jsx    # Registration form
│           ├── Dashboard.jsx       # Balance cards, charts, recent transactions
│           ├── Accounts.jsx        # Multi-currency accounts, ledger drill-down
│           ├── Transactions.jsx    # Filterable transaction history
│           ├── Transfer.jsx        # P2P transfer + bill payment
│           ├── Analytics.jsx       # Spending charts, category breakdown
│           ├── Savings.jsx         # Goals, deposits, progress bars
│           ├── FX.jsx              # Currency converter + rates table
│           ├── Notifications.jsx   # Alerts, mark-all-read
│           └── Settings.jsx        # Profile, KYC, MFA toggle, logout
```

---

## Database Schema (10 tables)

| Table              | Purpose                                      |
|--------------------|----------------------------------------------|
| users              | User accounts, KYC, MFA, roles               |
| accounts           | Bank accounts (multi-currency, balances)      |
| ledger_entries     | Double-entry bookkeeping (DEBIT/CREDIT)       |
| transactions       | Transfer and payment records                  |
| savings_goals      | Virtual vaults with targets                   |
| notifications      | In-app alerts                                 |
| beneficiaries      | Saved payees                                  |
| audit_logs         | Compliance trail                              |
| fx_rates           | Currency exchange rates                       |
| scheduled_payments | Recurring payment definitions                 |

---

## Design Patterns (from LLD)

- **CQRS** — Separate read/write models for transaction performance
- **Saga Pattern** — Distributed transaction with compensating rollback
- **Idempotency** — UUID-based duplicate prevention on transfers
- **Double-Entry Ledger** — Total Debit = Total Credit invariant
- **Circuit Breaker** — Resilience via graceful degradation
- **Zero Trust** — JWT validation on every request

---

## Default Demo Account

On first registration, the app seeds **60 days of realistic transaction history** across 8 spending categories, so the dashboard and analytics pages are immediately populated with data.

Starting balance: ₹50,000 (INR) + $500 (USD)
