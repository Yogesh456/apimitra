# ApiMitra — Deployment Guide

This app has two parts deployed separately:
- **Backend** (Node/Express) → Render or Railway (free tier)
- **Frontend** (React/Vite) → Vercel or Netlify (free tier)
- **Database** → MongoDB Atlas (already set up)

---

## 1. Before you deploy

- [ ] Confirm `.gitignore` exists and `.env` is NOT tracked by git (`git status` should not list `backend/.env`).
- [ ] Generate a fresh production `JWT_SECRET`:
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- [ ] Have your production Razorpay LIVE keys ready (or keep test keys to launch in test mode).

---

## 2. Deploy the backend (Render example)

1. Push your code to GitHub (the `.gitignore` keeps secrets out).
2. On [render.com](https://render.com) → **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** (from your `.env`, but production values):
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | the fresh random string you generated |
   | `CORS_ORIGINS` | your frontend URL (fill in AFTER step 3), e.g. `https://apimitra.vercel.app` |
   | `RAZORPAY_KEY_ID` | your key |
   | `RAZORPAY_KEY_SECRET` | your secret |
   | `FINPAY_API_KEY` | your FinPayUltra key |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | initial admin (change in-app after login) |
5. Deploy. Note the public URL, e.g. `https://apimitra-api.onrender.com`.
6. In **MongoDB Atlas → Network Access**, allow the host's IP (or `0.0.0.0/0` for any — simplest for free hosts with rotating IPs).

---

## 3. Deploy the frontend (Vercel example)

1. On [vercel.com](https://vercel.com) → **New Project** → import the same repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`  •  **Output:** `dist`
3. Add **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | your backend URL from step 2.5, e.g. `https://apimitra-api.onrender.com` |
4. Deploy. Note the frontend URL, e.g. `https://apimitra.vercel.app`.
5. **Go back to the backend host** and set `CORS_ORIGINS` to this frontend URL, then redeploy the backend.

---

## 4. Post-deploy checklist

- [ ] Open the frontend URL — the login page loads over HTTPS.
- [ ] Log in as admin → **Admin Account** tab → change the admin email & password.
- [ ] Test a wallet top-up (Razorpay test card `4111 1111 1111 1111`, any future expiry/CVV).
- [ ] Test a service query end to end.
- [ ] Add a real business name/address to the Terms & Privacy pages, and have them reviewed by a lawyer (Aadhaar/PAN → DPDP Act, 2023).

---

## Security features already built in
- Env-driven CORS allow-list (`CORS_ORIGINS`)
- `helmet` security headers
- Rate limiting: global (500/15min), auth (20/15min), OTP send (8/hour — protects SMS credits)
- bcrypt password hashing, JWT auth, HMAC-SHA256 Razorpay signature verification
- Error messages hidden in production (`NODE_ENV=production`)

## Note on build memory
`npm run build` (Vite) can use significant RAM. If your machine is low on memory, run the build on the host (Vercel/Netlify build in the cloud) rather than locally.
