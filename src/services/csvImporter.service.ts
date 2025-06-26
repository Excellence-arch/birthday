import { Readable } from 'stream';
import csv from 'csv-parser';
import User from '../models/user.model'; // adjust path as needed
import { ICsvUser } from '../interfaces/ICsvUser.interface'; // adjust path as needed

export const importUsersFromCSV = async (
  buffer: Buffer
): Promise<{ success: number; duplicates: number }> => {
  const results: ICsvUser[] = [];
  let successCount = 0;
  let duplicateCount = 0;

  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data: ICsvUser) => results.push(data))
      .on('end', async () => {
        try {
          for (const user of results) {
            // console.log(user);
            const dobRaw = user['Date of birth'];
            const dobStr = (dobRaw || '').toString().trim();

            // Determine if it's YYYY-MM-DD or MM-DD
            let dob: Date;

            if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
              // Full date provided (YYYY-MM-DD)
              dob = new Date(dobStr);
            } else if (/^\d{2}-\d{2}$/.test(dobStr)) {
              // Only MM-DD provided, default to current year
              const [month, day] = dobStr.split('-').map(Number);
              const today = new Date();
              dob = new Date(today.getFullYear(), month - 1, day);

              // If birthday already passed this year, schedule for next year
              if (dob < today) {
                dob.setFullYear(today.getFullYear() + 1);
              }
            } else {
              console.warn(`Invalid DOB format skipped: ${dobStr}`);
              continue; // skip invalid dates
            }

            // Check for duplicates based on name, phone, and normalized DOB
            const existingUser = await User.findOne({
              name: user.Fullname,
              phone: user['Whatsapp Number'],
              dob: {
                $gte: new Date(
                  new Date(dob).setFullYear(dob.getFullYear() - 1)
                ),
                $lte: new Date(
                  new Date(dob).setFullYear(dob.getFullYear() + 1)
                ),
              },
            });

            if (!existingUser) {
              await User.create({
                name: user.Fullname,
                phone: user['Whatsapp Number'],
                dob,
              });
              successCount++;
            } else {
              duplicateCount++;
              console.log(
                `Duplicate skipped: ${user.Fullname} (${user['Date of birth']})`
              );
            }
          }

          resolve({ success: successCount, duplicates: duplicateCount });
        } catch (err) {
          console.error('Error processing CSV data:', err);
          reject(err);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};
