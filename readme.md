# My Car Value 🚗

A **NestJS** backend application that allows users to submit car reports and receive estimated market prices based on historical data. The system supports authentication, role-based access control, report approval workflows, and price estimation using aggregated data.

---

## ✨ Features

- 🔐 **Authentication & Authorization**

  - User signup & signin
  - Session-based authentication
  - Role-based access control (USER, ADMIN, SUPER_ADMIN)
  - Automatic SUPER_ADMIN promotion via config

- 👤 **User Management**

  - Create, fetch, update, and delete users
  - Role updates with strict business rules

- 📊 **Car Reports**

  - Users can submit car valuation reports
  - Admins can approve or reject reports
  - Only approved reports are used for estimation by admins

- 📈 **Price Estimation**

  - Estimates based on:
    - Make & model
    - Year range
    - Location proximity (lat/lon)
    - Mileage similarity
  - Uses SQL aggregation for accurate averages

- 🧪 **Testing**
  - Unit tests for services and controllers
  - E2E tests for authentication and core flows
  - Fully mocked repositories and services

---

## 🛠 Tech Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **TypeORM**
- **PostgreSQL** (or compatible SQL DB)
- **Jest** for testing
- **ESLint + Prettier**

---

## 📂 Project Structure

```
src/
├── app.module.ts
├── config/               # App & DB configuration
├── guards/               # Auth / Role guards
├── interceptors/         # Serialization
├── users/                # Users & Auth domain
├── reports/              # Reports & Estimates domain
├── decorators/           # Custom decorators
├── types/                # Shared types
└── main.ts
```

---

## ⚙️ Environment Variables

The project uses multiple environment files:

- `.env.development`
- `.env.test`
- `.env.production`

### Example

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=my_car_value
APPLICATION_ADMIN_EMAIL=admin@test.com
DUMMY_PASSWORD=changeme
```

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Run database migrations

```bash
npm run typeorm:migrate
```

### 3️⃣ Start the app

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

---

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

---

## 🔑 API Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Users (Admin)

- `GET /auth`
- `GET /auth/:id`
- `PATCH /auth/:id`
- `DELETE /auth/:id`

### Reports

- `POST /reports` — create report (USER)
- `PATCH /reports/:id` — approve report (ADMIN)
- `GET /reports` — get price estimate

---

## 🛡 Security Notes

- Passwords are salted & hashed using **scrypt**
- SUPER_ADMIN role cannot be manually assigned
- All sensitive routes are guarded

---

## 📌 Scripts

```json
{
  "start": "nest start",
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "build": "nest build",
  "test": "jest",
  "test:e2e": "cross-env NODE_ENV=test npm run jest --config ./test/jest-e2e.json",
  "typeorm": "typeorm-ts-node-commonjs -d typeorm.datasource.ts"
}
```

---

## 📄 License

This project is for learning and internal use.

---

## 🙌 Acknowledgements

Built while practicing **advanced NestJS patterns**, including:

- Guards & Interceptors
- Role-based authorization
- Repository mocking
- Strict TypeScript + ESLint rules

---

Happy coding 🚀
