require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const serviceRoutes = require('./routes/services');
const walletRoutes = require('./routes/wallet');
const analyticsRoutes = require('./routes/analytics');
const contentRoutes = require('./routes/content');

const app = express();

// Behind a hosting proxy (Render/Railway/etc.) — needed for correct client IPs (rate limiting)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// ── CORS: env-driven allow-list ───────────────────────────────────
// CORS_ORIGINS is a comma-separated list, e.g.
//   CORS_ORIGINS=https://apimitra.vercel.app,https://www.apimitra.com
// Falls back to localhost for local development.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser tools (curl/postman) with no origin
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Global JSON parser — but SKIP the Razorpay webhook, which needs the raw body
// for HMAC signature verification (its route attaches its own express.raw()).
app.use((req, res, next) => {
  if (req.originalUrl === '/api/wallet/webhook') return next();
  express.json({ limit: '1mb' })(req, res, next);
});

// ── Rate limiting ─────────────────────────────────────────────────
// Global soft limit across the whole API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

// Stricter limit for auth (login/signup) — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a few minutes.' },
});

// Very strict limit for OTP send — protects your SMS credits from abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8,                    // max 8 OTP sends per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'OTP limit reached. Please try again later.' },
});

// Apply targeted limiters BEFORE the auth routes
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Fallback error handler — hide internals in production
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS')
    return res.status(403).json({ message: 'Origin not allowed' });
  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ message: isProd ? 'Server error' : err.message });
});

// Connect DB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Seed admin if not exists
    const { seedAdmin } = require('./controllers/adminSeed');
    await seedAdmin();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
