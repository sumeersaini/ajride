import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

import userRoutes from './routes/userRoutes';
import merchantRoutes from './routes/merchantRoutes';
import memberRoutes from './routes/memberRoutes';
import adminRoutes from './routes/adminRoutes';

import db from './models';
import auth from './middleware/auth';
var cron = require('node-cron');

import cronJob from './cron/cronJob';

declare global {
  namespace Express {
    interface Request {
      io: SocketIOServer;
    }
  }
}

const app = express();
const PORT = 4001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*', //replace with your frontend domain in production
    methods: ['GET', 'POST'],
  },
});

// Make io available in routes (so accept/reject APIs can emit events)
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Socket.IO connection
io.on('connection', (socket: Socket) => {
  console.log('🔌 Client connected:', socket.id);

  // ✅ Passenger joins a ride room
  // socket.on('join_ride', (data: { rideId: string }) => {
  //   const { rideId } = data;
  //   if (rideId) {
  //     socket.join(`ride_${rideId}`);
  //     console.log(`👤 Passenger socket ${socket.id} joined room ride_${rideId}`);

  //     // Debug: show who is in the room
  //   const socketsInRoom = io.sockets.adapter.rooms.get(room);
  //   console.log(`🚪 Sockets currently in room ${room}:`, socketsInRoom);
  //   }
  // });

  socket.on('join_ride', (data: { rideId: string }) => {
    const { rideId } = data;
    if (rideId) {
      const room = `ride_${rideId}`;
      socket.join(room);
      console.log(`Passenger socket ${socket.id} joined room ${room}`);

      // Debug: show who is in the room
      const socketsInRoom = io.sockets.adapter.rooms.get(room);
      console.log(`Sockets currently in room ${room}:`, socketsInRoom);
    }
  });

  // ✅ Driver joins their room (optional)
  socket.on('join_driver', (data: { driverId: string }) => {
    const { driverId } = data;
    if (driverId) {
      socket.join(`driver_${driverId}`);
      console.log(`🚖 Driver socket ${socket.id} joined room driver_${driverId}`);
    }
  });

  

  // ✅ Driver sends location updates
  socket.on('driver_location_update', (data: { rideId: string; lat: number; lng: number }) => {
    const { rideId, lat, lng } = data;
    console.log("driver location get", data)
    console.log(`📡 Driver location update for ride ${rideId}:`, lat, lng);

    // Broadcast to all passengers in this ride room
    io.to(`ride_${rideId}`).emit('driver_location', { lat, lng });
    console.log("passenger dr sent location")
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// CORS & JSON middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/merchant', auth, merchantRoutes);
app.use('/api/member', auth, memberRoutes);
app.use('/api/admin', auth, adminRoutes);

// DB sync + start server
db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at https://api-ajride.delightcoders.com/`);

     cron.schedule('*/2 * * * *', async () => {
      // This function will be executed every 4 minutes
      console.log('Cron job running capturePendingPayments');
      await cronJob.capturePendingPayments();

      // await cronjob.maticRevertBack();
    });

  });
});
