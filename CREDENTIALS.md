# 🔑 AUTO CARE — Login Credentials

> Run `npm run seed` inside the `backend/` folder to populate the database with these accounts.

---

## 👑 Admin Account

| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@autocare.com`      |
| Password | `Admin@123`               |
| Role     | Admin                     |
| Access   | Full system access, dashboard, analytics, user management, inventory, emergencies |

---

## 🔧 Mechanic Accounts

### Mechanic 1 (Primary)

| Field    | Value                       |
|----------|-----------------------------|
| Email    | `mechanic@autocare.com`     |
| Password | `Mechanic@123`              |
| Name     | Roshan Fernando             |
| Role     | Mechanic                    |
| Access   | Job dashboard, job details, status updates |

### Mechanic 2

| Field    | Value                        |
|----------|------------------------------|
| Email    | `mechanic2@autocare.com`     |
| Password | `Mechanic@123`               |
| Name     | Kasun Perera                 |
| Role     | Mechanic                     |

---

## 👤 Customer Accounts

### Customer 1 (Primary)

| Field    | Value                       |
|----------|-----------------------------|
| Email    | `customer@autocare.com`     |
| Password | `Customer@123`              |
| Name     | Dilan Wijethunga            |
| Role     | Customer                    |
| Access   | Book appointments, track service, manage vehicles, payments, feedback, emergency |

### Customer 2

| Field    | Value                        |
|----------|------------------------------|
| Email    | `customer2@autocare.com`     |
| Password | `Customer@123`               |
| Name     | Samantha Silva               |
| Role     | Customer                     |

---

## 🚗 Sample Vehicles (auto-seeded)

| Owner     | Vehicle                    | Plate         |
|-----------|----------------------------|---------------|
| Dilan     | 2019 Toyota Corolla        | WP CAB 1234   |
| Dilan     | 2021 Honda Civic           | WP CAB 5678   |
| Samantha  | 2020 Suzuki Alto           | SB CAC 9012   |

---

## 📦 Sample Inventory (auto-seeded)

10 inventory items are seeded including Engine Oil, Brake Pads, Spark Plugs, Battery, Coolant, etc.

---

## 📅 Sample Appointments (auto-seeded)

| Status      | Customer  | Vehicle       | Service           |
|-------------|-----------|---------------|-------------------|
| Completed   | Dilan     | Toyota Corolla| Oil Change        |
| Pending     | Dilan     | Honda Civic   | Brake Service     |
| In Progress | Samantha  | Suzuki Alto   | Full Service + AC |
| Confirmed   | Samantha  | Suzuki Alto   | Wheel Alignment   |

---

## 🌐 API Base URLs

| Service  | URL                          |
|----------|------------------------------|
| Backend  | `http://localhost:5000/api`  |
| Frontend | `http://localhost:5173`      |
| Health   | `http://localhost:5000/api/health` |

---

## 📱 SMS (Free — TextBelt)

- **Free tier**: 1 SMS per day per IP (no signup needed)
- **Key**: `textbelt` (set in `.env` as `TEXTBELT_KEY=textbelt`)
- **Paid**: $0.09/SMS with paid key from [textbelt.com](https://textbelt.com)

## 📧 Email (Free — Gmail SMTP)

1. Enable 2FA on your Gmail
2. Go to Google Account → Security → App Passwords
3. Generate an app password
4. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`
