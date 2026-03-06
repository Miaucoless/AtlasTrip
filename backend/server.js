require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const destinationRoutes = require('./routes/destinations');
const aiRoutes = require('./routes/ai');
const flightRoutes = require('./routes/flights');
const hotelRoutes = require('./routes/hotels');
const historyRoutes = require('./routes/history');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter – 200 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints – 20 req / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Make io accessible in routes
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Connect to Supabase
connectDB();

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'AtlasTrip API', db: 'supabase' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinTrip', (tripId) => {
    socket.join(`trip:${tripId}`);
    console.log(`Socket ${socket.id} joined trip:${tripId}`);
  });

  socket.on('leaveTrip', (tripId) => {
    socket.leave(`trip:${tripId}`);
  });

  socket.on('tripUpdate', (data) => {
    socket.to(`trip:${data.tripId}`).emit('tripUpdated', data);
  });

  socket.on('cursorMove', (data) => {
    socket.to(`trip:${data.tripId}`).emit('collaboratorCursor', { userId: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 AtlasTrip server running on port ${PORT}`);
});

