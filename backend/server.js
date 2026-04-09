// ============================================================
// server.js - Entry point for BugTracker Express Server
// Subject: AWT (01CE1412) | Unit 3: Backend Development
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (CO4 - Security: env variable usage)
dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/bugs',     require('./routes/bugRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));

// ─── Root route ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'BugTracker API running', version: '1.0.0' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database Connection & Server Start ──────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bugtracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
