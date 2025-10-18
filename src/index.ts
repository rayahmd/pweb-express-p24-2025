import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Express + Prisma + PostgreSQL API',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});