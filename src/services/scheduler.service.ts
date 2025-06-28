import cron from 'node-cron';
import User from '../models/user.model';
import { sendBirthdayReminder } from './notification.service';

// Run every minute for testing
const checkBirthdays = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('\n=== Starting birthday check ===');
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    console.log(`UTC-normalized today: ${today.toISOString()}`);

    try {
      const users = await User.find().populate('account');
      console.log(`Found ${users.length} users in database`);

      const accountBirthdays = new Map<
        string,
        { account: any; birthdays: Array<{ user: any; daysUntil: number }> }
      >();

      for (const user of users) {
        const dob = new Date(user.dob); // Use directly from DB
        const dobMonth = dob.getUTCMonth();
        const dobDate = dob.getUTCDate();

        // Create this year's DOB using UTC parts only
        let dobThisYear = new Date(
          Date.UTC(today.getUTCFullYear(), dobMonth, dobDate)
        );

        if (dobThisYear < today) {
          dobThisYear = new Date(
            Date.UTC(today.getUTCFullYear() + 1, dobMonth, dobDate)
          );
        }

        const msDiff = dobThisYear.getTime() - today.getTime();
        const dayDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

        console.log(`\nChecking user: ${user.name}`);
        console.log(`Stored DOB (UTC): ${dob.toISOString()}`);
        console.log(`DOB this year: ${dobThisYear.toISOString()}`);
        console.log(`Days until birthday: ${dayDiff}`);

        let daysUntil: number | null = null;
        if (dayDiff === 1 || dayDiff === 2) {
          daysUntil = dayDiff;
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
          console.log(
            `MATCH FOUND: ${user.name}'s birthday is in ${daysUntil} day(s)`
          );
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
