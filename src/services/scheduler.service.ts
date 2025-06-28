import cron from 'node-cron';
import User from '../models/user.model';
import { sendBirthdayReminder } from './notification.service';

// Run every day at 9:00 AM
const checkBirthdays = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Checking for upcoming birthdays...');

    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);

    try {
      // Find all users with birthdays
      const users = await User.find().populate('account');

      // Group birthdays by account
      const accountBirthdays = new Map<
        string,
        { account: any; birthdays: Array<{ user: any; daysUntil: number }> }
      >();

      for (const user of users) {
        const dob = new Date(user.dob);
        dob.setFullYear(today.getFullYear());

        let daysUntil: number | null = null;

        // Check if birthday is in 1 or 2 days
        if (
          dob.getDate() === twoDaysLater.getDate() &&
          dob.getMonth() === twoDaysLater.getMonth()
        ) {
          daysUntil = 2;
        } else if (
          dob.getDate() === oneDayLater.getDate() &&
          dob.getMonth() === oneDayLater.getMonth()
        ) {
          daysUntil = 1;
        }

        if (daysUntil !== null) {
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
        }
      }

      // Send one email per account with all birthdays
      for (const [accountId, data] of accountBirthdays) {
        await sendBirthdayReminder(data.account, data.birthdays);
      }

      console.log('Birthday check completed.');
    } catch (err) {
      console.error('Error checking birthdays:', err);
    }
  });
};

export default checkBirthdays;
