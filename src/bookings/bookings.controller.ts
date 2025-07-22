import { Request, Response } from 'express';
import { BookingsService } from './providers/bookings.service';
import { IBooking } from './interfaces/booking.interface';
import { IUser } from '../users/interfaces/user.interface';
import { Types } from 'mongoose';
import { validateCreateBookingDto } from './middlewares/validate-create-bookings-dto.middleware';
import { validateUpdateBookingDto } from './middlewares/validate-update-booking-dto.middleware';
import { RoomsService } from '../rooms/providers/room.service';
import { IRoom } from '../rooms/interface/room.interface';
import { getBookingWithRoomUserHotelDetailProvider } from './providers/booking-with-room-user-hotel-detail.provider';
import { getAllBookingsWithRoomUserHotelDetailProvider } from './providers/get-all-bookings-with-room-user-hotel-detail.provider';
import { getAllBookingsOfAHotelProvider } from './providers/get-all-bookings-a-hotel.provider';
import { IGetAllBookingQuery } from './interfaces/get-all-bookings.interface';
import { getAllBookingsOfARoomProvider } from './providers/get-all-bookings-a-room.provider';
import { getAllBookingsOfAUserProvider } from './providers/all-bookings-of-a-user.provider';
import { rejectUserBookingProvider } from './providers/reject-user-booking.provider';
import { cancelMyBookingProvider } from './providers/cancel-my-booking.provider';
import { confirmUserBookingProvider } from './providers/confirm-user-booking.provider';
import { checkinUserBookingProvider } from './providers/checkin-user-booking.provider';
import { checkoutUserBookingProvider } from './providers/checkout-user-booking.provider';
import HotelModel from '../hotels/hotels.model';
import { MessageRoom } from '../messages/model/message.model';
import { UserRole } from '../users/enums/user-role.enum';
import UserModel from '../users/users.model';

export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly roomsService: RoomsService
  ) {}

  // get all bookings
  async getAllBookings(req: Request, res: Response) {
    console.log('get all bookings...');
    try {
      const data = await this.bookingsService.findAllBookings(
        req.query as IGetAllBookingQuery
      );

      res.status(200).json({
        status: 'success',
        pagination: data.pagination,
        data: data.bookings,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: (err as Error).message,
      });
    }
  }
  // get booking
  async getBooking(req: Request, res: Response) {
    console.log('get booking...');
    try {
      const booking = await this.bookingsService.findBooking(req.params.id);

      if (!booking) {
        res.status(404).json({
          status: 'error',
          message: 'Booking not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: booking,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: (err as Error).message,
      });
    }
  }
  // create booking
  async createBooking(req: Request, res: Response) {
    console.log('create booking...');
    try {
      const createBookingDto: IBooking = req.body;
      const user: IUser = req.user;
      createBookingDto.user = new Types.ObjectId(user._id!);

      if (user.isOnboarding) {
        res.status(400).json({
          status: 'fail',
          message:
            'You need to complete your onboarding before you can book a hotel',
        });
        return;
      }

      if (!user.isVerified) {
        res.status(400).json({
          status: 'fail',
          message: 'you are account is not verified yet',
        });
        return;
      }

      const validationResult = validateCreateBookingDto(createBookingDto);

      if (validationResult.success === false) {
        const validationErrors = validationResult.error.errors.map(
          (error) => error.message
        );
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors,
        });
        return;
      }

      const room = (await this.roomsService.findRoom(
        createBookingDto.room.toString()
      )) as IRoom;

      if (!room) {
        res.status(404).json({
          status: 'error',
          message: 'Room not found',
        });
        return;
      }

      const booking = await this.bookingsService.createBooking({
        ...createBookingDto,
        hotel: room.hotel,
      });

      const hotel = await HotelModel.findById(room.hotel);
      if (!hotel) {
        res.status(404).json({
          status: 'error',
          message: 'Hotel not found',
        });
        return;
      }

      // Create Chat Room
      const cashers  = await UserModel.find({
        hotel: hotel._id,
        role: UserRole.CASHIER,
      });
      await MessageRoom.create({
        roomId: ` ${hotel.name}`,
        hotelId: hotel._id,
        users: [user._id, ...cashers.map((cashier) => cashier._id)],
        messages: [],
      });




      

      res.status(201).json({
        status: 'success',
        data: booking,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: (err as Error).message,
      });
    }
  }
  // update booking
  async updateBooking(req: Request, res: Response) {
    console.log('update booking...');
    try {
      const updateBookingDto: Partial<IBooking> = req.body;

      const validationResult = validateUpdateBookingDto(updateBookingDto);

      if (validationResult.success === false) {
        const validationErrors = validationResult.error.errors.map(
          (error) => error.message
        );
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors,
        });
        return;
      }

      if (updateBookingDto.room) {
        const room = await this.roomsService.findRoom(
          updateBookingDto.room.toString()
        );

        if (!room) {
          res.status(404).json({
            status: 'error',
            message: 'Room not found',
          });
          return;
        }
      }

      const booking = await this.bookingsService.updateBooking(
        req.params.id,
        req.body
      );

      if (!booking) {
        res.status(404).json({
          status: 'error',
          message: 'Booking not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: booking,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: (err as Error).message,
      });
    }
  }
  // delete booking
  async deleteBooking(req: Request, res: Response) {
    console.log('delete booking...');
    try {
      const booking = await this.bookingsService.deleteBooking(req.params.id);

      if (!booking) {
        res.status(404).json({
          status: 'error',
          message: 'Booking not found',
        });
        return;
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: (err as Error).message,
      });
    }
  }

  // get bookings with room user hotel detail
  getBookingWithRoomUserHotelDetail(req: Request, res: Response) {
    getBookingWithRoomUserHotelDetailProvider(req, res);
  }

  // get all bookings with room user hotel detail
  getAllBookingsWithRoomUserHotelDetail(req: Request, res: Response) {
    getAllBookingsWithRoomUserHotelDetailProvider(req, res);
  }

  // get all bookings of a hotel
  getAllBookingsOfAHotel(req: Request, res: Response) {
    getAllBookingsOfAHotelProvider(req, res);
  }

  // get all bookings of a room
  getAllBookingsOfARoom(req: Request, res: Response) {
    getAllBookingsOfARoomProvider(req, res);
  }

  // get all bookings of a user
  getAllBookingsOfAUser(req: Request, res: Response) {
    getAllBookingsOfAUserProvider(req, res);
  }

  // reject user booking
  rejectUserBooking(req: Request, res: Response) {
    rejectUserBookingProvider(req, res);
  }

  // cancel my booking
  cancelMyBooking(req: Request, res: Response) {
    cancelMyBookingProvider(req, res);
  }

  // confirm user booking
  confirmUserBooking(req: Request, res: Response) {
    confirmUserBookingProvider(req, res);
  }

  // checkin-user-booking.provider
  checkinUserBooking(req: Request, res: Response) {
    checkinUserBookingProvider(req, res);
  }

  // checkout-user-booking.provider
  checkoutUserBooking(req: Request, res: Response) {
    checkoutUserBookingProvider(req, res);
  }
}
