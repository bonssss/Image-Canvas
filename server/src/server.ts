import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Image Discovery & Generation API',
  });
});

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Image Discovery & AI Generation Server running on http://localhost:${config.port}`);
  console.log(`📡 API Endpoints available at http://localhost:${config.port}/api`);
});

export default app;
