# Fixyads Project Management Platform

A robust, role-based project management portal and admin panel built with Next.js, Prisma, and PostgreSQL.

## 🌟 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for **Admins**, **Clients**, and **Employees**.
- **Secure Authentication:** Powered by NextAuth.js with encrypted credentials (bcrypt).
- **Project & Task Management:** Create roadmaps, track tasks, and manage project lifecycles.
- **Modern Tech Stack:** Built with Next.js 14+ (App Router), React, and TypeScript.
- **Database Architecture:** PostgreSQL database managed safely with Prisma ORM.
- **Responsive UI:** Styled seamlessly with Tailwind CSS for mobile and desktop support.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Database:** PostgreSQL (via [Supabase](https://supabase.com/) / [Neon](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 🛠️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/KALIL-devs/project_management_platform.git
cd project_management_platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your database and authentication secrets:
```env
# Database connection URLs
DATABASE_URL="postgresql://user:password@host:port/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Push the Prisma schema to your PostgreSQL database to create the necessary tables:
```bash
npx prisma db push
```

Generate the default Admin user by running the seed script:
```bash
npm run seed
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Demo Credentials

When logging in locally or on the demo deployment, you can use the following default roles to explore the application:

**Admin Account**
- Email: `admin@portal.com`
- Password: `admin123`

**Client Account**
- Email: `client@portal.com`
- Password: `client123`

**Employee Account**
- Email: `emp@portal.com`
- Password: `emp123`

## 📦 Deployment

This project is optimized for deployment on platforms like Vercel. 
Ensure that all `.env` variables (especially `NEXTAUTH_URL` and `NEXTAUTH_SECRET`) are correctly added to your deployment platform's dashboard before building.

1. Connect your repository to Vercel/Netlify.
2. Add your Environment Variables.
3. Deploy! (Prisma generate runs automatically during the `postinstall` script).
