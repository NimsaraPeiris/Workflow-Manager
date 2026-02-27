# Workflow Management System

A robust task management and workflow tracking system built with React, Supabase, and Prisma. Features role-based access control, departmental task isolation, real-time status updates, and comprehensive audit logging.

## 🚀 Features

- **Role-Based Access Control**: Admin, Department Head, and Employee roles.
- **Task Management**: Create, assign, and track tasks through their lifecycle.
- **Department Isolation**: Workflows are segregated by department for focused collaboration.
- **Organization Overview**: High-level performance metrics and brief task lists for leads and admins.
- **Audit Logs**: Full history of task activities and status changes.
- **Approvals & History**: Dedicated views for approved and cancelled task archives.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **Animations**: Framer Motion

## ⚙️ Environment Variables

Create a `.env` file in the root of the `Task-Manager-App` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Connection (Prisma)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
```

## 📦 Installation & Setup

1. **Clone the repository** (if applicable)
2. **Navigate to the frontend directory**:
   ```bash
   cd Task-Manager-App
   ```
3. **Install dependencies**: 
   ```bash
   npm install
   ```

## 🗄️ Database Setup

The project uses Prisma for schema management and queries.

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
2. **Push Schema to Database**:
   ```bash
   npx prisma db push
   ```
   *Note: Use `prisma db push` for rapid development. For production-like environments, consider using `prisma migrate dev` if you have a migrations history.*

## 🏃 Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🧪 Running Tests

```bash
npm test
```

## 🔑 Demo Credentials
___________________________________________________________________
| Role                      |   Email                  | Password  |
|---------------------------|--------------------------|-----------|
| **Super Admin**           | `admin@fochant.lk`       | `nimsara` |
| **IT Head**               | `it_head@fochant.lk`     | `dilusha` |
| **Design Head**           | `design_head@fochant.lk` | `hansana` |
| **Designer 1 (Employee)** | `designer1@fochant.lk`   | `nimsara` |
| **Designer 2 (Employee)** | `designer2@fochant.lk`   | `sasanka` |
--------------------------------------------------------------------

*Built for Fochant - Alpha Version 1.0.1-Stable*