# ApiMitra 🔍

A full-stack web app for selling API services (PAN lookup, Vehicle details, etc.) with a user portal, admin panel, wallet system, and Razorpay payments.

## Tech Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose) + Razorpay
- **Frontend**: React + Vite + Tailwind CSS + Recharts

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, Razorpay keys, API keys
node src/index.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Default Admin Login
- **Email**: `admin@apimitra.com`  
- **Password**: `Admin@123`  
(Change these in `.env` before first run)

## API Keys to Add (in backend `.env`)
| Variable | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Same |
| `PAN_API_KEY` | Your PAN lookup API key |
| `PAN_API_URL` | Your PAN API endpoint |
| `VEHICLE_API_KEY` | Your vehicle lookup API key |
| `VEHICLE_API_URL` | Your vehicle API endpoint |

## Features
- User signup → admin approval → service access
- Wallet top-up via Razorpay
- 3 built-in services (configurable from admin)
- Admin: approve/block/edit users, adjust wallet balances
- Admin: add/edit/disable/delete any service with custom API URL
- Admin analytics dashboard with revenue chart

## Adding a New Service (Admin UI)
1. Go to Admin → Services → Add Service
2. Set the API URL and API Key
3. Set **Param Map** as JSON: maps your input field names → API parameter names
   Example: `{"regNo": "registration_number"}`
4. Set cost per query, enable, save.
