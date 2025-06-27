// types/express.d.ts
import { IAccountRequest } from '../src/interfaces/Account.interface';

declare global {
  namespace Express {
    interface User extends IAccountRequest {}
    interface Request {
      user?: {
        _id?: Types.ObjectId;
          email: string;
          avatar: string;
          name: string;
          accessToken?: string;
          createdAt?: Date;
          updatedAt?: Date;
          __v?: number;
      }
    }
  }
}
