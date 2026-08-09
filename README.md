# 💰 Personal Finance Tracker System

A modern, full-stack web application designed to help users effortlessly manage their personal finances, track income and expenses, and gain valuable visual insights into their spending habits.

## ✨ Key Features

- **📊 Interactive Dashboard**: Visual financial insights and dynamic charts powered by **Recharts**.
- **💸 Income & Expense Management**: Easily log, categorize, and track daily financial transactions.
- **🔐 Secure Authentication**: User registration and sign-in with **JWT** authentication and **bcryptjs** password hashing.
- **⚡ Modern Frontend**: High-performance UI built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**.
- **🗄️ Robust Backend**: RESTful API built with **Node.js**, **Express.js**, and **MongoDB/Mongoose**.
- **📱 Responsive & Beautiful UI**: Premium, mobile-friendly design for tracking finances anywhere.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security & Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** instance (local or Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/imashaliyanage482/Personal-Finance-Tracker-System.git
cd Personal-Finance-Tracker-System
```

### 2. Install Dependencies
Install all required frontend and backend packages:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Run the Application
You can run both the frontend development server and the backend server concurrently:
```bash
npm run dev:all
```
- **Frontend App**: Available at `https://fintrack-seven-rho.vercel.app:5173`
- **Backend API**: Available at `https://fintrack-seven-rho.vercel.app:5000`

