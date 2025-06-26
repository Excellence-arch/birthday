// types/express.d.ts
import { Account } from './../interfaces/Account.interface';

declare global {
  namespace Express {
    interface User extends Account {}
  }
}
