import express from 'express';
import { BookingsService } from './providers/bookings.service';
import { BookingsController } from './bookings.controller';
import { AuthController } from '../auth/auth.controller';
import { RoomsService } from '../rooms/providers/room.service';
import { UserRole } from '../users/enums/user-role.enum';

const router = express.Router();

const bookingsService = new BookingsService();
const roomsService = new RoomsService();
const bookingsController = new BookingsController(
  bookingsService,
  roomsService
);

const authController = new AuthController();

// protected routes
router.use((req, res, next) => authController.protect(req, res, next));

router.get('/booking-with-room-user-hotel-detail/:id', (req, res) =>
  bookingsController.getBookingWithRoomUserHotelDetail(req, res)
);

router.get(
  '/all-bookings-with-room-user-hotel-detail',
  authController.restrictTo(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER),
  (req, res) =>
    bookingsController.getAllBookingsWithRoomUserHotelDetail(req, res)
);

router.get('/all-bookings-of-a-room/:roomId', (req, res) =>
  bookingsController.getAllBookingsOfARoom(req, res)
);

router.get(
  '/all-bookings-of-a-hotel/:hotelId',
  authController.restrictTo(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER),
  (req, res) => bookingsController.getAllBookingsOfAHotel(req, res)
);
// get all bookings of a user
router.get('/all-bookings-of-a-user/:userId',
  authController.restrictTo(UserRole.USER, UserRole.ADMIN),
  (req, res) => bookingsController.getAllBookingsOfAUser(req, res)
);

router.get('/:id', (req, res) => bookingsController.getBooking(req, res));
router.post('/', authController.restrictTo(UserRole.USER), (req, res) =>
  bookingsController.createBooking(req, res)
);
router.patch(
  '/:bookingId/reject-user-booking/:userId',
  authController.restrictTo(UserRole.MANAGER, UserRole.CASHIER),
  (req, res) => bookingsController.rejectUserBooking(req, res)
);
// confirm user booking
router.patch(
  '/:bookingId/confirm-user-booking/:userId',
  authController.restrictTo(UserRole.MANAGER, UserRole.CASHIER),
  (req, res) => bookingsController.confirmUserBooking(req, res)
);

// checkin user booking
router.patch(
  '/:bookingId/checkin-user-booking/:userId',
  authController.restrictTo(UserRole.MANAGER, UserRole.CASHIER),
  (req, res) => bookingsController.checkinUserBooking(req, res)
);

// checkout user booking
router.patch(
  '/:bookingId/checkout-user-booking/:userId',
  authController.restrictTo(UserRole.MANAGER, UserRole.CASHIER),
  (req, res) => bookingsController.checkoutUserBooking(req, res)
);

router.patch(
  '/cancel-my-booking',
  authController.restrictTo(UserRole.USER),
  (req, res) => bookingsController.cancelMyBooking(req, res)
);

// admin routes
router.use(authController.restrictTo(UserRole.ADMIN));

router.patch('/:id', (req, res) => bookingsController.updateBooking(req, res));
router.get('/', (req, res) => bookingsController.getAllBookings(req, res));
router.delete('/:id', (req, res) => bookingsController.deleteBooking(req, res));

export const bookingRoutes = router;
