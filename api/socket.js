import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

const ALLOWED_ORIGINS = [
  'https://alfietz.shop',
  'https://alfietz.vercel.app',
  'https://alfietz-zeta.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

let io;
let httpServer;
let redisSub;

function init() {
  if (io) return io;

  httpServer = createServer();

  io = new Server(httpServer, {
    transports: ['websocket'],
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true
    }
  });

  if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    redisSub = new Redis(process.env.UPSTASH_REDIS_URL, {
      password: process.env.UPSTASH_REDIS_TOKEN,
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 5000)
    });

    redisSub.subscribe('alfie:events');
    redisSub.on('message', (_channel, message) => {
      try {
        const { event, data, targetRoom } = JSON.parse(message);
        io.to(targetRoom).emit(event, data);
      } catch (e) {
        console.error('[Socket] Redis message error:', e);
      }
    });
  }

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`[Socket] User ${userId} connected`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId || 'unknown'} disconnected`);
    });
  });

  return io;
}

export default async function handler(req, res) {
  init();

  if (req.headers.upgrade?.toLowerCase() === 'websocket') {
    httpServer.emit('upgrade', req, req.socket, Buffer.alloc(0));
    return new Promise(() => {});
  }

  res.status(200).json({ ok: true });
}
