import { NextFunction, Request, Response } from 'express';
import { IUser } from '../users/interfaces/user.interface';
import { protectRoutes } from './providers/protect.provider';
import { updateMyPasswordProvider } from './providers/update-my-password.provider';
import { loginProvider } from './providers/login.provider';
import { forgotPasswordProvider } from './providers/forgot-password.provider';
import { resetPasswordProvider } from './providers/reset-password.provider';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export class AuthController {
  async login(req: Request, res: Response) {
    loginProvider(req, res);
  }

  public logout(req: Request, res: Response) {
    res.cookie('token', 'loggedOut', {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      status: 'success',
    });
  }

  // PROTECT ROUTES
  async protect(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    protectRoutes(req, res, next);
  }

  // RESTRICT ACCESS TO ROUTES
  public restrictTo(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      next();
    };
  }

  async updateMyPassword(req: Request, res: Response) {
    updateMyPasswordProvider(req, res);
  }

  async forgotPassword(req: Request, res: Response) {
    forgotPasswordProvider(req, res);
  }

  async resetPassword(req: Request, res: Response) {
    resetPasswordProvider(req, res);
  }
}
