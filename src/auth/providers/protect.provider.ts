import { NextFunction, Request, Response } from 'express';
import { verifyJWT } from '../../lib/utils/token.util';
import UserModel from '../../users/users.model';
import { IUser } from '../../users/interfaces/user.interface';

// PROTECT ROUTES
export async function protectRoutes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
      return;
    }

    // 2) Verification token
    const decoded = verifyJWT(token);

    // 3) Check if user still exists
    const currentUser = (await UserModel.findById(decoded.id)) as IUser;

    if (!currentUser) {
      res.status(401).json({
        status: 'fail',
        message: 'The User belonging to the token doe no longer exist',
      });

      return;
    }

    req.user = currentUser;
    // GRANT ACCESS TO PROTECTED ROUTE
    next();
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Invalid token. Please log in again',
    });
  }
}
