// models/Activity.model.ts
import { Schema, model } from 'mongoose';

const activitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    type: {
      type: String,
      enum: ['contact_added', 'birthday_updated', 'reminder_set'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Activity', activitySchema);
