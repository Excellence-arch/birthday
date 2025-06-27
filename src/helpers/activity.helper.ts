// helpers/activity.helper.ts
import { Types } from 'mongoose';
import Activity from '../models/activity.model';

export const getRecentActivity = async (userId: Types.ObjectId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch recent activity');
  }
  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return activities.map((activity) => ({
    type: activity.type,
    message: activity.message,
    date: activity.createdAt,
  }));
};
