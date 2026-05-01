# AUTO CARE - Project Guide and Report

Intelligent Vehicle Service Center Management System

## 1) Project Overview

AUTO CARE is a full-stack web application for managing a vehicle service center.  
It supports three user roles:

- Admin: manages users, mechanics, appointments, inventory, and analytics
- Mechanic: handles assigned jobs and updates service progress
- Customer: registers vehicles, books appointments, tracks service, and makes payments

The solution is built with a React frontend and a Node.js/Express backend, connected to MongoDB.

## 2) Core Objectives

- Digitalize the full service workflow from booking to completion
- Provide role-based access for secure operations
- Improve communication with in-app, email, and SMS notifications
- Track inventory and operational performance from an admin dashboard

## 3) Technology Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- State Management: Zustand (auth), TanStack Query
- Visualization: Recharts
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Authentication: JWT + bcryptjs
- Real-time: Socket.IO
- Notifications: Nodemailer (email), TextBelt (SMS)
- Payments: Stripe sandbox/mock flow

## 4) High-Level Architecture

### Frontend

- UI pages by role (`admin`, `mechanic`, `customer`)
- Shared layout components and route protection
- Central API service layer for HTTP communication
- Auth state and token persistence via store

### Backend

- Route layer receives API requests
- Controller layer handles request/response mapping
- Service layer contains business logic
- Model layer defines MongoDB schemas and persistence
- Middleware handles auth, role checks, error handling, and rate limiting

## 5) Project Structure

```text
autocare/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── CREDENTIALS.md
└── CURSOR_GUIDE.md
```

## 6) Frontend Module Summary

### Authentication and Access

- Login and registration pages
- JWT-based session handling
- Role-based route redirection after login

### Customer Features

- Dashboard overview
- Vehicle management
- Appointment booking and tracking
- Emergency request submission
- Payment and feedback flows

### Mechanic Features

- Assigned jobs list
- Job detail and status updates
- Service progress handling

### Admin Features

- Dashboard and analytics
- User and mechanic management
- Appointment assignment and status control
- Inventory and stock monitoring

## 7) Backend Module Summary

### Authentication Module

- Register/login
- Profile fetch/update
- Password update
- Token verification

### Appointments Module

- Slot availability checks
- Appointment creation
- Assignment to mechanics
- Status and cancellation handling

### Users and Vehicles Module

- Customer profile operations
- Vehicle CRUD endpoints

### Inventory Module

- Inventory CRUD
- Restock operations
- Low-stock and statistics endpoints

### Emergency Module

- Emergency request creation
- Assignment and resolution workflow

### Notification Module

- In-app notification creation and retrieval
- Read/unread status tracking
- Email and SMS sending utilities

### Payment Module

- Payment status updates
- Completion-related notification triggers

## 8) API Endpoint Groups

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `GET /api/auth/verify`

### Appointments

- `GET /api/appointments/slots`
- `POST /api/appointments`
- `GET /api/appointments/my`
- `GET /api/appointments/mechanic`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id/status`
- `PUT /api/appointments/:id/assign`
- `PUT /api/appointments/:id/cancel`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/toggle`
- `POST /api/admin/mechanics`
- `GET /api/admin/analytics`

### Inventory

- `GET /api/inventory`
- `GET /api/inventory/stats`
- `GET /api/inventory/low-stock`
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `PUT /api/inventory/:id/restock`
- `DELETE /api/inventory/:id`

### Vehicles

- `GET /api/users/vehicles`
- `POST /api/users/vehicles`
- `PUT /api/users/vehicles/:id`
- `DELETE /api/users/vehicles/:id`

### Emergency

- `POST /api/emergency`
- `GET /api/emergency`
- `PUT /api/emergency/:id/assign`
- `PUT /api/emergency/:id/resolve`

## 9) Environment Configuration

### Backend `.env` (minimum)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autocare
JWT_SECRET=autocare_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Optional:

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
TEXTBELT_KEY=textbelt
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=AUTO CARE
```

## 10) Local Setup and Run

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Access:

- Backend health: `http://localhost:5000/api/health`
- Frontend app: `http://localhost:5173`

## 11) Main User Flows

### Customer Flow

1. Register/login
2. Add vehicle
3. Select appointment slot and book
4. Receive status updates
5. Complete payment
6. Submit feedback

### Admin Flow

1. View dashboard metrics
2. Manage users/mechanics
3. Assign appointments
4. Monitor inventory levels
5. Review analytics

### Mechanic Flow

1. Open assigned jobs
2. Update work progress and status
3. Complete service tasks

## 12) Business Rules (Important)

- Only authenticated users can access protected endpoints
- Role guards control admin/mechanic/customer-specific operations
- Appointment status transitions are role-controlled
- Inventory updates are admin-only operations
- Notification triggers occur on major lifecycle events

## 13) Testing Checklist

- Login works for admin, mechanic, customer
- Appointment booking and assignment flow works end to end
- Mechanic can update service status
- Admin can manage inventory and users
- Email/SMS paths fail gracefully when config is not set
- Payment completion updates appointment state correctly

## 14) Common Issues and Fixes

### MongoDB not connected

- Ensure MongoDB service is running
- Verify `MONGODB_URI` in backend `.env`

### CORS errors

- Confirm `FRONTEND_URL` is correct in backend `.env`
- Ensure frontend and backend URLs match running ports

### Port conflicts

```bash
npx kill-port 5000
npx kill-port 5173
```

### JWT 401 errors

- Re-login to refresh token
- Verify `JWT_SECRET` exists in backend `.env`

## 15) Submission Notes (Important)

For source-code submission:

- Keep implementation files clean and readable
- Remove unnecessary inline comments from source code
- Keep only essential comments where logic is complex
- Do not include secrets in `.env`; submit `.env.example` instead
- Ensure project runs from fresh install using setup steps above

## 16) Future Enhancements

- Advanced reporting export (CSV/PDF)
- Real-time chat for customer-mechanic communication
- Push notifications
- Service history insights and predictive maintenance

---

AUTO CARE - Final Year Project Report Guide
