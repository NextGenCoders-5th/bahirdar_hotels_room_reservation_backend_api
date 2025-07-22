import 'dotenv/config';
import { createApp } from './app';
import { connectToMongoDB } from './mongo-connection';
import './lib/config/environment.config';
import { envConfig } from './lib/config/environment.config';
import http from 'http';
import { setupSocketServer } from './socket';

const PORT = envConfig.PORT || 5000;

async function startServer() {
  try {
    await connectToMongoDB();
    const app = createApp();

    const server = http.createServer(app);
    setupSocketServer(server); // <-- initialize Socket.IO

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
