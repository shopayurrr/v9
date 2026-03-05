# Wells Fargo Clone - Project Documentation

## 🚀 Quick Start (10 Seconds)
1. **Database**: Automatically provisioned. Run `npm run db:push` to sync schema.
2. **Install**: `npm install`
3. **Run**: `npm run dev` (Port 5000)
4. **Admin Login**:
   - **Username**: `OPPATHEBEAR`
   - **Password**: `55Fp4MUtd22MRFr`

---

## 🏗 Project Structure
- `client/`: React + Vite + Tailwind + Shadcn UI.
- `server/`: Express + tsx.
  - `routes.ts`: API endpoints (Auth, User, Admin).
  - `storage.ts`: Database interface using Drizzle ORM.
  - `db.ts`: PostgreSQL connection pool.
- `shared/`: Zod schemas and TypeScript types shared between frontend and backend.
- `public/`: Legacy static HTML pages (Banking simulator assets).

---

## 🛠 Features & Status

### ✅ Working
- **Authentication**: Session-based login/logout with persistent PostgreSQL store.
- **Admin Panel**:
  - Full CRUD for users.
  - Add User/Edit User forms are synchronized with 15+ fields (SSN, DOB, Address, etc.).
  - Initial balance and Account Type (Checking/Saving) selection.
  - Real-time balance adjustment for user accounts.
- **User Dashboard**:
  - Account summary view.
  - Profile information view.
- **Database**: Automatic schema synchronization and persistence.

### ⚠️ Known Issues / Bugs (Do Not Fix)
- **Password Security**: Passwords are currently stored in plain text (Simulation only).
- **Transaction History**: The "Recent Transactions" field is a raw JSON/Text area; it does not yet parse into a structured table on the user dashboard.
- **Form Validation**: Some advanced fields (SSN, Phone) lack strict regex validation on the frontend.
- **Session Timeout**: No automatic session timeout implemented.

---

## 🔌 Connections & Config
- **Frontend ↔ Backend**: React Query (TanStack) calls `/api/*` endpoints.
- **Database**: PostgreSQL via `DATABASE_URL`. Drizzle ORM manages the `users` and `accounts` tables.
- **Port**: Always runs on **5000**.
- **Admin Logic**: The admin user `OPPATHEBEAR` is hardcoded in `server/routes.ts` to ensure persistent access even if the database is cleared.

---

## 👥 User Management System
Admins can manage users via the `AdminPanel.tsx` component. When a user is created:
1. A record is added to the `users` table.
2. An initial account is created if an initial balance is provided.
3. Admins can later "Edit Profile" to update PII or "Edit Balance" to modify live account totals.
