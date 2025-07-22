import { Request, Response } from 'express';
import BookingModel from '../bookings.model';
import { IBooking } from '../interfaces/booking.interface';
import { BookingStatus } from '../enums/booking-status.enum';

export async function cancelMyBookingProvider(req: Request, res: Response) {
  console.log('cancel-my-booking.provider...');
  try {
    const { bookingId } = req.query as { bookingId: string };
    const booking = (await BookingModel.findById(bookingId)) as IBooking;

    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found',
      });
      return;
    }

    if (booking.isPaid) {
      res.status(400).json({
        status: 'fail',
        message: 'Booking is already paid, cannot be cancelled',
      });
      return;
    }

    const updatedData: Partial<IBooking> = {
      status: BookingStatus.CANCELLED,
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
      message: 'booking cancelled successfully',
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
