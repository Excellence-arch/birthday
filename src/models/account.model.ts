import {Document, Schema, model} from 'mongoose';
import { IAccount } from '../interfaces/Account.interface';

const accountSchema = new Schema<IAccount>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});


export default model<IAccount>('Account', accountSchema);