import cron from 'node-cron';
import User from '../models/user.model';
import { sendBirthdayReminder } from './notification.service';
import { IUser } from '../interfaces/IUser.interface';

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
      const users = await User.find();

      users.forEach((user: IUser) => {
        const dob = new Date(user.dob);
        dob.setFullYear(today.getFullYear());

        if (
          (dob.getDate() === twoDaysLater.getDate() &&
            dob.getMonth() === twoDaysLater.getMonth()) ||
          (dob.getDate() === oneDayLater.getDate() &&
            dob.getMonth() === oneDayLater.getMonth())
        ) {
          console.log(`Found upcoming birthday for ${user.name}`);
          sendBirthdayReminder(user);
        }
      });
      console.log('Birthday check completed.');
    } catch (err) {
      console.error('Error checking birthdays:', err);
    }
  });
};

export default checkBirthdays;
