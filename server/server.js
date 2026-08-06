import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scansRouter from './routes/scans.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS Configuration (Strict origin in production, allowed localhost for dev)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === CLIENT_URL || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ScamShield AI API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/scans', scansRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 ScamShield AI Server running on port ${PORT}`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
  console.log(`===========================================`);
});
