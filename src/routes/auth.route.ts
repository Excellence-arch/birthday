// authRouter.ts
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken'; // Don't forget to import jwt
import { configurePassport } from './../utils/passport'; // Adjust the path as necessary
import { Request, Response } from 'express';
// import { Account } from '../interfaces/Account.interface';

const router = Router();

configurePassport(router);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be defined in environment variables');
      }

      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.redirect(
        `https://birthday-pwa.vercel.app/dashboard?token=${token}&user=${encodeURIComponent(
          JSON.stringify(user)
        )}`
      );
      // res.json({
      //   message: 'Authentication successful',
      //   user,
      //   token,
      // });
      return;
    } catch (error) {
      console.error('Error during authentication callback:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  }
);

export default router;
