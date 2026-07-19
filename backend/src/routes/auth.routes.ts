import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required.'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/\d/)
      .withMessage('Password must contain at least one number.'),
  ],
  validate,
  authController.register
);

router.post(
  '/verify-email',
  [body('token').isString().notEmpty()],
  validate,
  authController.verifyEmail
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [body('token').isString().notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  authController.resetPassword
);

router.get('/me', requireAuth, authController.me);

export default router;
