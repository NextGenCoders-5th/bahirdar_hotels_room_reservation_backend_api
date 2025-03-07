import { Request, Response } from 'express';
import HotelModel from '../../hotels/hotels.model';
import ReviewModel from '../review.model';
import { Types } from 'mongoose';

export async function getAllReviewsOfAHotelProvider(
  req: Request,
  res: Response
) {
  console.log('get all reviews of a hotel');
  try {
    const { hotelId } = req.params;

    const hotel = await HotelModel.findById(hotelId);

    if (!hotel) {
      res.status(400).json({
        status: 'fail',
        message: 'Hotel not found',
      });
      return;
    }

    const reviews = await ReviewModel.aggregate([
      {
        $match: {
          hotel: new Types.ObjectId(hotelId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        hotel,
        reviews,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: (err as Error).message,
    });
  }
}
