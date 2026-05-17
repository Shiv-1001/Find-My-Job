# Find My Job – Local Job Finder

A full-stack job portal web application.

## 📁 Project Structure

```
findmyjob-v1/
├── frontend/
│   └── index.html        # Complete single-file frontend (HTML + CSS + JS)
└── backend/
    ├── server.js         # Express server entry point
    ├── package.json      # Node.js dependencies
    ├── .env.example      # Environment variables template
    ├── middleware/
    │   └── auth.js       # JWT authentication middleware
    ├── models/
    │   ├── User.js       # Mongoose User model
    │   ├── Job.js        # Mongoose Job model
    │   └── Application.js# Mongoose Application model
    └── routes/
        ├── auth.js       # Auth routes (login/register)
        ├── jobs.js       # Job CRUD routes
        ├── users.js      # User profile routes
        └── applications.js # Job application routes
```

## 🚀 Setup & Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend
Open `frontend/index.html` in a browser, or serve with any static server.

## 🛠 Tech Stack
- **Frontend**: HTML, CSS, Vanilla JS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jsonwebtoken), bcryptjs
