// passportConfig.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request } from 'express';
import accountModel from '../models/account.model';
import { Account } from '../interfaces/Account.interface';

export const configurePassport = (app: any) => {
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: Account, done) => {
    done(null, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.CALLBACK_URL!,
        passReqToCallback: true,
      },
      async (
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void
      ) => {
        try {
          let account: any = await accountModel.findOne({
            email: profile.emails[0].value,
          });

          if (!account) {
            account = await accountModel.create({
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              name: profile.displayName,
            });
          }

          // Convert Mongoose document to plain JS object if needed
          const userObject: Account = {
            _id: account._id,
            email: account.email,
            avatar: account.avatar,
            name: account.name,
            accessToken,
          };

          req.user = userObject;

          return done(null, userObject);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  app.use(passport.initialize());
};
