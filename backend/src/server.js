import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { connectMongoDB } from './config/db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize database connection & seed demo data
connectMongoDB().then(async () => {
  try {
    await seedDatabase();
  } catch (err) {
    console.error('Seed error:', err);
  }
}).catch(err => {
  console.warn('DB connect warning:', err);
});

// Healthcheck endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'WINTER ARC API',
    mongoUriConfigured: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

// Mount API routes on both /api and root / for Vercel rewrites
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`❄️  WINTER ARC BACKEND SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`    API URL: http://localhost:${PORT}/api`);
    console.log(`==================================================`);
  });
}

export default app;
