import { Types } from 'mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  dob: Date;
  account: Types.ObjectId;
  createdAt: Date;
}
