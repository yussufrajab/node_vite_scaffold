import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { env } from './config/index.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupSocket } from './socket/index.js';
import { startCleanupJob } from './jobs/index.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use(errorHandler);

setupSocket(httpServer);
startCleanupJob();

httpServer.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

export default app;
