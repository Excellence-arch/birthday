import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/IUser.interface';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IUser>('User', userSchema);
