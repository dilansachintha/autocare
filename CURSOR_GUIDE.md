# 🚗 AUTO CARE — Complete Developer Guide (Cursor)

> Intelligent Vehicle Service Center Management System  
> React + TypeScript + Node.js + Express + MongoDB + Tailwind CSS

---

## 📁 Project Structure

```
autocare/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers (thin layer)
│   │   ├── middleware/     # Auth, error handler, rate limiter
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic (fat layer)
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Seeder
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/     # CustomerLayout, MechanicLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── customer/   # Dashboard, Appointments, Vehicles...
│   │   │   ├── mechanic/   # Dashboard, Jobs, JobDetail
│   │   │   └── admin/      # Dashboard, Users, Inventory...
│   │   ├── services/       # Axios API client
│   │   ├── store/          # Zustand auth store
│   │   └── types/          # TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
│
├── CREDENTIALS.md          # ← All login credentials here
└── CURSOR_GUIDE.md         # ← This file
```

---

## 🚀 Step-by-Step Setup in Cursor

### Step 1 — Prerequisites

Install these before starting:

```bash
# Check Node.js version (need 18+)
node --version

# Install MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

---

### Step 2 — Open Project in Cursor

1. Open **Cursor**
2. Go to **File → Open Folder**
3. Select the `autocare/` folder
4. You'll see `backend/` and `frontend/` side by side

---

### Step 3 — Setup Backend

Open Cursor terminal (`Ctrl + \`` or `View → Terminal`):

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

Now edit `.env` in Cursor — **minimum required** to run:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autocare
JWT_SECRET=autocare_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

For email notifications (optional), add Gmail app password:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```

---

### Step 4 — Seed the Database

```bash
# Still inside backend/
npm run seed
```

You should see:
```
✅ Connected to MongoDB
🧹 Cleared existing data
👥 Users seeded
🚗 Vehicles seeded
📦 Inventory seeded
📅 Appointments seeded
✅ Database seeded successfully!

🔑 Login Credentials:
  Admin    → admin@autocare.com      / Admin@123
  Mechanic → mechanic@autocare.com   / Mechanic@123
  Customer → customer@autocare.com   / Customer@123
```

---

### Step 5 — Start Backend

```bash
# In backend/ folder
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚗 AUTO CARE Server running on port 5000
📡 Environment: development
🌐 API URL: http://localhost:5000/api
🔧 Health: http://localhost:5000/api/health
```

Test it: open browser → `http://localhost:5000/api/health`

---

### Step 6 — Setup Frontend

Open a **new terminal** in Cursor (`+` button in terminal panel):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

The `.env` file for frontend:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=AUTO CARE
```

---

### Step 7 — Start Frontend

```bash
# In frontend/ folder
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```

Open browser → `http://localhost:5173`

---

### Step 8 — Login & Test

Use the **Demo Login buttons** on the login page for quick access, or use the credentials from `CREDENTIALS.md`.

| Role     | Redirect After Login        |
|----------|-----------------------------|
| Admin    | `/admin/dashboard`          |
| Mechanic | `/mechanic/dashboard`       |
| Customer | `/customer/dashboard`       |

---

## 🔌 API Endpoints Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile         (authenticated)
PUT    /api/auth/profile         (authenticated)
PUT    /api/auth/change-password (authenticated)
GET    /api/auth/verify          (authenticated)
```

### Appointments
```
GET    /api/appointments/slots?date=2024-12-25   (get available slots)
POST   /api/appointments                          (customer)
GET    /api/appointments/my                       (customer)
GET    /api/appointments/mechanic                 (mechanic)
GET    /api/appointments                          (admin)
GET    /api/appointments/:id
PUT    /api/appointments/:id/status               (mechanic/admin)
PUT    /api/appointments/:id/assign               (admin)
PUT    /api/appointments/:id/cancel
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
POST   /api/admin/mechanics
GET    /api/admin/analytics
```

### Inventory
```
GET    /api/inventory
GET    /api/inventory/stats
GET    /api/inventory/low-stock
POST   /api/inventory              (admin)
PUT    /api/inventory/:id          (admin)
PUT    /api/inventory/:id/restock  (admin)
DELETE /api/inventory/:id          (admin)
```

### Vehicles
```
GET    /api/users/vehicles         (customer)
POST   /api/users/vehicles         (customer)
PUT    /api/users/vehicles/:id     (customer)
DELETE /api/users/vehicles/:id     (customer)
```

### Emergency
```
POST   /api/emergency              (customer)
GET    /api/emergency              (admin/mechanic)
PUT    /api/emergency/:id/assign   (admin)
PUT    /api/emergency/:id/resolve  (admin/mechanic)
```

### Notifications, Messages, Feedback, Payments — see source files

---

## 🔧 Cursor AI Tips

Use these prompts in Cursor Chat (`Ctrl+L`) to extend the project:

```
"Add a real-time chat widget between customer and mechanic 
 using socket.io — show in the appointment detail page"

"Add invoice PDF generation for completed appointments 
 using pdfkit in the backend"

"Add a Google Maps embed (free iframe, no API key needed) 
 on the emergency page to help customer share location"

"Add dark mode support using Tailwind's dark: classes 
 and save preference in localStorage"

"Add SMS notification when appointment status changes 
 using the existing TextBelt integration in notification.service.ts"

"Create an admin report page that exports appointment 
 data as CSV using a download button"
```

---

## 🐛 Common Issues & Fixes

### MongoDB connection error
```bash
# Make sure MongoDB is running
sudo systemctl start mongod        # Linux
brew services start mongodb-community  # Mac
net start MongoDB                  # Windows
```

### Port already in use
```bash
# Kill process on port 5000
npx kill-port 5000
# Kill process on port 5173
npx kill-port 5173
```

### TypeScript errors in Cursor
```bash
# Rebuild
cd backend && npm run build
```

### CORS error in browser
- Make sure `FRONTEND_URL=http://localhost:5173` in backend `.env`
- Make sure both servers are running

### JWT expired / 401 errors
- Click the logout button and log in again
- Check `JWT_SECRET` is set in `.env`

---

## 📦 Tech Stack Summary

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, TailwindCSS         |
| State      | Zustand (auth), TanStack Query (server state)   |
| Charts     | Recharts                                         |
| Backend    | Node.js, Express, TypeScript                    |
| Database   | MongoDB, Mongoose                               |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| Real-time  | Socket.IO                                       |
| Email      | Nodemailer (Gmail SMTP — free)                  |
| SMS        | TextBelt (1 free SMS/day, no signup)            |
| Maps       | Removed (replaced with text location field)     |
| Payment    | Stripe Sandbox (mock mode — no real charges)    |

---

## 🏗️ Adding New Features (Pattern)

Follow this pattern for every new feature:

```
1. Create Model  →  backend/src/models/Feature.model.ts
2. Create Service →  backend/src/services/feature.service.ts  (business logic)
3. Create Controller → backend/src/controllers/feature.controller.ts  (thin, calls service)
4. Create Router →  backend/src/routes/feature.routes.ts  (add auth middleware)
5. Register Router → backend/src/index.ts  (app.use('/api/feature', featureRoutes))
6. Add API call → frontend/src/services/api.ts
7. Create Page  →  frontend/src/pages/.../Feature.tsx
8. Add Route   →  frontend/src/App.tsx
9. Add Nav link →  frontend/src/components/layout/[Role]Layout.tsx
```

---

## 🚀 Production Deployment

### Backend (Railway / Render — free tier)
```bash
cd backend
npm run build
# Set environment variables in Railway/Render dashboard
# Deploy dist/ folder
```

### Frontend (Vercel / Netlify — free)
```bash
cd frontend
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to your backend URL
```

### MongoDB (MongoDB Atlas — free 512MB)
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Replace `MONGODB_URI` in backend `.env`

---

*AUTO CARE — Dilan Sachintha Wijethunga — COM646 Project*
