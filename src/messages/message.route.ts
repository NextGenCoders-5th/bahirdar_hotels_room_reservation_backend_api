import express from 'express';

import { AuthController } from '../auth/auth.controller';
import { UserRole } from '../users/enums/user-role.enum';
import { MessageController } from './controllers/message.controller';

const messageController = new MessageController();
const authController = new AuthController();

const router = express.Router();

router.use((req, res, next) => authController.protect(req, res, next));

router.get('/my-rooms', authController.restrictTo(UserRole.CASHIER, UserRole.USER), (req, res) =>
  messageController.getMyRooms(req, res)
);

export const messageRouter = router;
