

import { Request, Response } from 'express';
import { MessageRoom } from '../model/message.model';
import { UserRole } from '../../users/enums/user-role.enum';
import { StatusCodes } from 'http-status-codes';

export class MessageController {
    /**
     * Get chat rooms for the authenticated user.
     * If the user is an admin or manager, return all rooms.
     * Otherwise, return rooms specific to the user.
     */
    async getMyRooms(req: Request, res: Response): Promise<void> {
        try {
        const userId = req.user._id;
        const userRole = req.user.role;
    
        // Fetch rooms based on user role
        console.log(req.user);
        console.log("User Role:", userRole);
        let rooms;
        if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
            rooms = await MessageRoom.find({}).populate('messages.userId');
        } else {
            rooms = await MessageRoom.find({ users: { $in: [userId] } });
        }
    
        if (!rooms || rooms.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
            status: 'fail',
            message: 'No chat rooms found',
            });
            return;
        }
    
        res.status(StatusCodes.OK).json({
            status: 'success',
            data: {
            rooms,
            },
        });
        } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: (err as Error).message,
        });
        }
    }

}

