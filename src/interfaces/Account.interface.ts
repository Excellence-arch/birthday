// interfaces/Account.interface.ts
import { Document, Types } from 'mongoose';

export interface IAccount extends Document {
  email: string;
  avatar: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Account = {
  _id: Types.ObjectId;
  email: string;
  avatar: string;
  name: string;
  accessToken?: string; // optional if you store it
};
