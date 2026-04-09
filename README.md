# BugTracker Pro — MERN Stack Full-Stack Application
**Subject:** Advanced Web Technology (01CE1412) | Marwadi University  
**Branch:** Computer Engineering | **Semester:** 4  

---

## Project Overview
BugTracker Pro is a secured full-stack web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It simulates a real-world issue tracking system like Jira with **role-based access control** for Admin, Developer, and Tester users.

---

## Tech Stack
| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Bootstrap 5, React Router 6, Axios |
| Backend    | Node.js, Express.js, REST API           |
| Database   | MongoDB (Mongoose ODM)                  |
| Auth       | JWT (jsonwebtoken), bcrypt              |
| Security   | Role-Based Access Control, CORS, .env  |

---

## Folder Structure
```
bugtracker/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── bugController.js         # Bug CRUD + Comments
│   │   ├── projectController.js     # Project CRUD
│   │   └── userController.js        # User management (Admin)
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT protect + RBAC authorize
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt pre-save)
│   │   ├── Bug.js                   # Bug schema (comments, activity)
│   │   └── Project.js               # Project schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bugRoutes.js
│   │   ├── projectRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example                 # Environment variable template
│   ├── package.json
│   └── server.js                    # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   │   ├── LoginForm.js      # JWT login with validation
    │   │   │   └── RegisterForm.js   # Registration with validation
    │   │   ├── Admin/
    │   │   │   ├── UserManageTable.js  # Admin user CRUD
    │   │   │   └── ProjectsPanel.js    # Project management
    │   │   ├── Developer/
    │   │   │   └── MyBugsPanel.js      # Dev assigned bugs + claim
    │   │   ├── Tester/
    │   │   │   └── ReportBugForm.js    # Bug reporting with validation
    │   │   └── Shared/
    │   │       ├── AppLayout.js        # Sidebar + topbar layout
    │   │       ├── BugTable.js         # Reusable filterable bug table
    │   │       ├── SeverityBadge.js    # Critical / High / Low badge
    │   │       ├── StatusBadge.js      # Open / In Progress / Fixed badge
    │   │       ├── LoadingSpinner.js
    │   │       └── EmptyState.js
    │   ├── context/
    │   │   ├── AuthContext.js          # JWT auth global state
    │   │   └── BugContext.js           # Bug & Project global state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js        # Stats + recent bugs
    │   │   ├── BugListPage.js          # Filterable bug list
    │   │   ├── BugDetailPage.js        # Full bug detail + comments
    │   │   ├── ReportBugPage.js
    │   │   ├── ProjectsPage.js
    │   │   ├── MyBugsPage.js
    │   │   ├── UserManagePage.js
    │   │   └── ActivityPage.js
    │   ├── utils/
    │   │   └── api.js                  # Axios instance + API functions
    │   ├── App.js                      # React Router config
    │   ├── index.js                    # React entry point
    │   └── styles.css                  # Global CSS + Bootstrap overrides
    └── package.json
```

---

## CO Mapping
| CO   | Description                                           | Files                                  |
|------|-------------------------------------------------------|----------------------------------------|
| CO1  | JavaScript/TypeScript & React component-based UI      | All frontend components & pages        |
| CO2  | Interactive, scalable UI with React patterns          | BugTable, Context API, React Router    |
| CO3  | Backend: Node.js, Express, REST APIs, MongoDB         | All backend controllers, models, routes|
| CO4  | Security: JWT, bcrypt, RBAC, env vars                 | authMiddleware, authController, User model |
| CO5  | Modern frameworks + full-stack deployment             | App.js routing, server.js, README      |

---

## Setup Instructions

### 1. Clone / Extract the project
```bash
unzip bugtracker.zip
cd bugtracker
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

npm run dev        # Development (nodemon)
# or
npm start          # Production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Environment Variables (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bugtracker
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint             | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | `/api/auth/register`| Public  | Register new user  |
| POST   | `/api/auth/login`   | Public  | Login + get JWT    |
| GET    | `/api/auth/me`      | Private | Get current user   |

### Bug Routes (`/api/bugs`)
| Method | Endpoint                  | Access              | Description       |
|--------|--------------------------|---------------------|-------------------|
| GET    | `/api/bugs`               | Private             | Get all bugs      |
| POST   | `/api/bugs`               | Tester, Admin       | Report new bug    |
| GET    | `/api/bugs/:id`           | Private             | Get bug by ID     |
| PUT    | `/api/bugs/:id`           | Developer, Admin    | Update bug        |
| DELETE | `/api/bugs/:id`           | Admin               | Delete bug        |
| POST   | `/api/bugs/:id/comments`  | Private             | Add comment       |

### Project Routes (`/api/projects`)
| Method | Endpoint           | Access | Description         |
|--------|--------------------|--------|---------------------|
| GET    | `/api/projects`    | Private| Get all projects    |
| POST   | `/api/projects`    | Admin  | Create project      |
| PUT    | `/api/projects/:id`| Admin  | Update project      |
| DELETE | `/api/projects/:id`| Admin  | Delete project      |

### User Routes (`/api/users`)
| Method | Endpoint        | Access | Description     |
|--------|----------------|--------|-----------------|
| GET    | `/api/users`   | Admin  | Get all users   |
| PUT    | `/api/users/:id`| Admin | Update user role|
| DELETE | `/api/users/:id`| Admin | Delete user     |

---

## Roles & Permissions
| Feature               | Admin | Developer | Tester |
|-----------------------|-------|-----------|--------|
| View all bugs         | ✅    | ✅        | ✅     |
| Report bug            | ✅    | ❌        | ✅     |
| Update bug status     | ✅    | ✅        | ❌     |
| Assign bug            | ✅    | ❌        | ❌     |
| Delete bug            | ✅    | ❌        | ❌     |
| Claim unassigned bug  | ❌    | ✅        | ❌     |
| Manage users          | ✅    | ❌        | ❌     |
| Create projects       | ✅    | ❌        | ❌     |

---

## Security Implementation (CO4)
- **JWT Authentication:** Token generated on login, verified on every protected route via `Authorization: Bearer <token>` header
- **bcrypt Password Hashing:** Passwords hashed with salt rounds=10 using pre-save Mongoose hook; plain passwords never stored
- **Role-Based Access Control:** `protect` middleware verifies JWT; `authorize(...roles)` middleware restricts routes by role
- **Environment Variables:** Sensitive config (JWT_SECRET, MONGO_URI) stored in `.env`, never committed to Git
- **CORS:** Configured to allow only the React frontend origin

---

## GitHub Deployment
```bash
git init
git add .
git commit -m "Initial commit: BugTracker Pro MERN App"
git remote add origin https://github.com/yourusername/bugtracker-pro.git
git push -u origin main
```

---

## Submission Details
- **Subject:** AWT (01CE1412)
- **Topic:** Design and Development of a Secured Full-Stack Web Application using MERN Stack
- **Total Marks:** 50
- **Deadline:** 10th April 2026
