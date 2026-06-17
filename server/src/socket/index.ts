import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { env } from '../config/index.js';

let io: SocketServer;

export function setupSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('ping:client', (data) => {
      socket.emit('pong:server', { received: data, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
