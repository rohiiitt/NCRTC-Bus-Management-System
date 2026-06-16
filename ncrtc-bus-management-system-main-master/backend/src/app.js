// src/app.js

const express = require('express');
const cors    = require('cors');
const app     = express();

// CORS — allow frontend on localhost:5173 (Vite) and any Vercel URL
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3000',
    ];
    // Allow Vercel deployments and no-origin (Postman)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — for Docker / Render uptime checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NCRTC Backend running', time: new Date() });
});

// All module routes
app.use('/auth',      require('./routes/auth.route'));
app.use('/avls',      require('./routes/avls.route'));
app.use('/duties',    require('./routes/duty.route'));
app.use('/incidents', require('./routes/incident.route'));
app.use('/notices',   require('./routes/notice.route'));
app.use('/vehicles',  require('./routes/vehicle.route'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
