import { Request, Response } from 'express';
import UserModel from '../../users/users.model';
import { IUser } from '../../users/interfaces/user.interface';
import BookingModel from '../bookings.model';
import { Types } from 'mongoose';
import { IBooking } from '../interfaces/booking.interface';
import { BookingStatus } from '../enums/booking-status.enum';

export async function checkoutUserBookingProvider(req: Request, res: Response) {
  console.log('checkout-user-booking.provider...');
  try {
    const { bookingId, userId } = req.params;

    const user = (await UserModel.findById(userId)) as IUser;

    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
      return;
    }

    const booking = (await BookingModel.findOne({
      user: new Types.ObjectId(userId),
      _id: new Types.ObjectId(bookingId),
    })) as IBooking;

    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found',
      });
      return;
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      res.status(400).json({
        status: 'fail',
        message: 'Booking is not checked in yet',
      });
      return;
    }

    const updatedData: Partial<IBooking> = {
      status: BookingStatus.CHECKED_OUT,
    };

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      updatedData,
      {
        new: true,
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'booking checked out successfully',
      data: updatedBooking,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: (err as Error).message,
    });
  }
}
