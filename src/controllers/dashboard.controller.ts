// controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import Account from '../models/account.model';
import User from '../models/user.model';
import { getRecentActivity } from '../helpers/activity.helper';
import { Types } from 'mongoose';

export const getDashboardData = async (req: Request, res: Response) => {
  try {

    const userId: Types.ObjectId | undefined = req.user?._id;

    console.log("Hello");

    if(!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get upcoming birthdays (next 30 days)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    // Get total contacts created by the user
    const [totalContacts, upcomingBirthdays, currentMonthBirthdays, recentActivity] = await Promise.all([
      User.countDocuments({ account: userId }),

    

    User.aggregate([
      {
        $match: {
          account: new Types.ObjectId(userId),
        },
      },
      {
        $project: {
          name: 1,
          dob: 1,
          phone: 1,
          nextBirthday: {
            $let: {
              vars: {
                year: { $year: today },
                birthDate: {
                  $dateFromParts: {
                    year: { $year: today },
                    month: { $month: '$dob' },
                    day: { $dayOfMonth: '$dob' },
                  },
                },
                nextBirthDate: {
                  $dateFromParts: {
                    year: {
                      $cond: [
                        { $lt: [{ $month: '$dob' }, { $month: today }] },
                        { $year: { $add: [today, 365 * 24 * 60 * 60 * 1000] } },
                        {
                          $cond: [
                            {
                              $and: [
                                {
                                  $eq: [{ $month: '$dob' }, { $month: today }],
                                },
                                {
                                  $lt: [
                                    { $dayOfMonth: '$dob' },
                                    { $dayOfMonth: today },
                                  ],
                                },
                              ],
                            },
                            {
                              $year: {
                                $add: [today, 365 * 24 * 60 * 60 * 1000],
                              },
                            },
                            { $year: today },
                          ],
                        },
                      ],
                    },
                    month: { $month: '$dob' },
                    day: { $dayOfMonth: '$dob' },
                  },
                },
              },
              in: {
                $cond: [
                  { $lt: ['$$birthDate', today] },
                  '$$nextBirthDate',
                  '$$birthDate',
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          nextBirthday: {
            $gte: today,
            $lte: nextMonth,
          },
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          date: {
            $dateToString: {
              format: '%b %d',
              date: '$nextBirthday',
            },
          },
          daysLeft: {
            $ceil: {
              $divide: [
                { $subtract: ['$nextBirthday', today] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
          relation: 'Friend', // Placeholder
        },
      },
      { $sort: { daysLeft: 1 } },
      { $limit: 5 },
    ]),

    // Get count of birthdays this month for this user
    User.countDocuments({
      account: userId,
      $expr: {
        $eq: [{ $month: '$dob' }, { $month: today }],
      },
    }),

    // Get recent activity for this user
    getRecentActivity(userId)
  ]);

    const stats = [
      {
        title: 'Total Contacts',
        value: totalContacts,
      },
      {
        title: 'Upcoming Events',
        value: upcomingBirthdays.length,
      },
      {
        title: 'Birthdays This Month',
        value: currentMonthBirthdays,
      },
    ];

    res.json({
      stats,
      upcomingEvents: upcomingBirthdays,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
