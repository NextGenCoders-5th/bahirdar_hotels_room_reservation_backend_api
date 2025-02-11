import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import { userRoutes } from './users/users.routes';
import { hotelRoutes } from './hotels/hotels.routes';
import { roomRoutes } from './rooms/room.routes';
import { bookingRoutes } from './bookings/bookings.routes';
import { reviewRoutes } from './review/review.routes';
import { authRoutes } from './auth/auth.route';
import { favoritesRoutes } from './favorites/favorites.route';
import { paymentRoutes } from './payments/payments.route';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [
        'https://hotel-booking-app-frontend-seven.vercel.app',
        'http://localhost:5173',
      ],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serving static files
  app.use(express.static(path.resolve(__dirname, `./../public`)));

  // test route
  app.use('/test', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Hello World' });
  });

  // all routes
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/hotels', hotelRoutes);
  app.use('/api/v1/rooms', roomRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/favorites', favoritesRoutes);
  app.use('/api/v1/payments', paymentRoutes);

  // not found route
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`,
    });
  });

  // global error handler middleware
  app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
      status: 'error',
      message: (err as Error).message,
    });
  });

  return app;
}
