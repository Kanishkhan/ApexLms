import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect database
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 LMS Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔌 Listening on http://localhost:${PORT}`);
    console.log('==================================================');
  });

  // Handle graceful shutdowns
  const shutdown = () => {
    console.log('🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('💤 Server process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('❌ Failed to boot LMS server: ', err);
  process.exit(1);
});
