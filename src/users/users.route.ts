import express from 'express';
import { UsersService } from './providers/users.service';
import { UsersController } from './user.controller';
import { AuthController } from '../auth/auth.controller';
import { UserRole } from './enums/user-role.enum';
import { multerUpload } from '../lib/utils/file-upload.util';
import { UserPhoto } from './enums/user-photo.enum';

const router = express.Router();

const usersService = new UsersService();
const usersController = new UsersController(usersService);

const authController = new AuthController();

const upload = multerUpload({ dirName: 'users', isImage: true });

// protect routes
router.use((req, res, next) => authController.protect(req, res, next));

router.get('/current-user', (req, res) =>
  usersController.getCurrentUser(req, res)
);

router.get('/user-with-bookings', (req, res) =>
  usersController.getUserWithBookings(req, res)
);

router.post(
  '/complete-onboarding',
  upload.fields([
    { name: UserPhoto.PROFILE_PICTURE, maxCount: 1 },
    { name: UserPhoto.ID_PHOTO_BACK, maxCount: 1 },
    { name: UserPhoto.ID_PHOTO_FRONT, maxCount: 1 },
  ]),
  (req, res) => usersController.completeOnboarding(req, res)
);

router.get('/manager-with-detail', (req, res) =>
  usersController.getManagerWithDetails(req, res)
);

router.patch('/request-identity-verification', (req, res) =>
  usersController.requestIdentityVerification(req, res)
);

router.patch('/:id', upload.single('image'), (req, res) =>
  usersController.updateUser(req, res)
);

// restrict routes
router.use(authController.restrictTo(UserRole.ADMIN, UserRole.MANAGER));
router.get('/', (req, res) => usersController.getAllUsers(req, res));

router.use(authController.restrictTo(UserRole.ADMIN));

router.patch('/verify-user-account/:id', (req, res) =>
  usersController.verifyUserAccount(req, res)
);

router.patch('/decline-verification-request/:id', (req, res) =>
  usersController.declineVerificationRequest(req, res)
);

router.get('/onboarding-users', (req, res) =>
  usersController.getAllOnboardingUsers(req, res)
);

router.get('/verification-requests', (req, res) =>
  usersController.getAllVerificationRequests(req, res)
);

router.get('/:id', (req, res) => usersController.getUser(req, res));
router.post('/', (req, res) => usersController.createUser(req, res));
// router.patch('/:id', upload.single('image'), (req, res) =>
//   usersController.updateUser(req, res)
// );
router.delete('/:id', (req, res) => usersController.deleteUser(req, res));

export const userRoutes = router;
