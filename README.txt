# Personal Finance Tracker (Web App) — Advanced Databases (NoSQL)

A full-stack web application that allows users to track personal income/expenses, manage budgets, and view financial reports. Built as a final project for the course **Advanced Databases (NoSQL)**.  
Requirements include RESTful API, MongoDB data modeling (embedded + referenced), aggregation pipelines, advanced update/delete operations, indexing, and authentication/authorization.:contentReference[oaicite:1]{index=1}:contentReference[oaicite:2]{index=2}

---

## 1) Project Overview

### Key Features
- User registration and login (JWT authentication)
- Categories management (income/expense)
- Transactions CRUD (track spending & income)
- Monthly budget limits (embedded items per month/category)
- Reports via aggregation:
  - Monthly income/expense summary
  - Top spending categories
- Frontend pages:
  - Login
  - Dashboard (reports)
  - Categories
  - Transactions
  - Budgets
  - About/Donations 

### Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT

---

## 2) System Architecture

### High-level Flow
1. **Frontend (React)** sends HTTP requests to backend REST API
2. **Backend (Express)** validates JWT, applies business logic, and communicates with MongoDB
3. **MongoDB** stores user-scoped data (users, categories, transactions, budgets)
4. **Aggregation endpoints** compute summaries for dashboard and budget comparison

### Components
- **Client**: UI pages + apiFetch wrapper (adds Authorization header)
- **Server**:
  - routes/ (auth, categories, transactions, budgets, reports)
  - controllers/ (business logic)
  - middleware/ (JWT auth)
  - models/ (Mongoose schemas)

---

## 3) Database Schema Description (MongoDB)

### Collections
#### 1) users
- Stores registered users.
- Fields: `name`, `email (unique)`, `passwordHash`, timestamps

#### 2) categories (referenced)
- Per-user categories of transactions.
- Fields: `userId (ref User)`, `name`, `type: "income" | "expense"`, timestamps

#### 3) transactions (referenced)
- Transaction records referencing a category.
- Fields:  
  - `userId (ref User)`  
  - `categoryId (ref Category)`  
  - `type: "income" | "expense"`  
  - `amount (Number)`  
  - `date (ISO date)`  
  - `note (String, optional)`  
  - timestamps

#### 4) budgets (embedded + referenced)
- One budget document per user per month.
- Fields:
  - `userId (ref User)`
  - `month: "YYYY-MM"`
  - `items: [ { categoryId (ref Category), limit (Number) } ]`  ← **embedded items**
  - timestamps

**Design decision**: `budgets.items` is embedded to keep monthly limits in a single document and enable advanced updates using positional operators and `$pull`.

---

## 4) MongoDB Queries (Examples)

> These queries illustrate CRUD, advanced updates/deletes, and aggregations required by the course.:contentReference[oaicite:3]{index=3}

### CRUD Examples
**Create category**
```js
db.categories.insertOne({ userId, name: "Food", type: "expense" })
