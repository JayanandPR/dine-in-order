import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initWebSocket } from './utils/websocket';
import apiRoutes from './routes/index';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow localhost and local network
    if (
      origin.includes('localhost') ||
      origin.includes('192.168.') ||
      ENV.CLIENT_ORIGINS.includes(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok', env: ENV.NODE_ENV }));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initWebSocket(server);

connectDB().then(() => {
  server.listen(ENV.PORT, () => {
    console.log(`Server running on http://localhost:${ENV.PORT}`);
  });
});