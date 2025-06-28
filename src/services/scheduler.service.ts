import cron from 'node-cron';
import User from '../models/user.model';
import { sendBirthdayReminder } from './notification.service';

// Helper to normalize a date to remove time component
const normalizeDate = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Run every minute for testing
const checkBirthdays = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('\n=== Starting birthday check ===');
    console.log(`Current time: ${new Date().toString()}`);
    console.log(`UTC time: ${new Date().toISOString()}`);

    const now = new Date();
    const today = normalizeDate(now);
    console.log(`Normalized today: ${today.toString()}`);

    try {
      const users = await User.find().populate('account');
      console.log(`Found ${users.length} users in database`);

      const accountBirthdays = new Map<
        string,
        { account: any; birthdays: Array<{ user: any; daysUntil: number }> }
      >();

      for (const user of users) {
        const originalDob = new Date(user.dob);
        const dobThisYear = new Date(
          today.getFullYear(),
          originalDob.getMonth(),
          originalDob.getDate()
        );

        console.log(`\nChecking user: ${user.name}`);
        console.log(`Original DOB: ${originalDob.toString()}`);
        console.log(
          `DOB this year before adjustment: ${dobThisYear.toString()}`
        );

        // If the birthday this year already passed, check next year's
        if (dobThisYear < today) {
          dobThisYear.setFullYear(today.getFullYear() + 1);
        }

        const dayDiff = Math.floor(
          (dobThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`Day difference: ${dayDiff}`);

        let daysUntil: number | null = null;
        if (dayDiff === 1 || dayDiff === 2) {
          daysUntil = dayDiff;
        }

        if (daysUntil !== null) {
          console.log(
            `MATCH FOUND: ${user.name}'s birthday is in ${daysUntil} day(s)`
          );
          const accountId = user.account._id.toString();

          if (!accountBirthdays.has(accountId)) {
            accountBirthdays.set(accountId, {
              account: user.account,
              birthdays: [],
            });
          }
          accountBirthdays.get(accountId)?.birthdays.push({
            user,
            daysUntil,
          });
        } else {
          console.log(`No match for ${user.name}`);
        }
      }

      console.log(`\nSummary:`);
      console.log(`Accounts with birthdays: ${accountBirthdays.size}`);

      for (const [accountId, data] of accountBirthdays) {
        console.log(`\nPreparing email for account: ${accountId}`);
        console.log(`Email address: ${data.account.email}`);
        console.log(`Birthdays to notify: ${data.birthdays.length}`);

        try {
          await sendBirthdayReminder(data.account, data.birthdays);
          console.log('Email sent successfully');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }

      console.log('\n=== Birthday check completed ===\n');
    } catch (err) {
      console.error('Critical error in birthday check:', err);
    }
  });
};

export default checkBirthdays;
