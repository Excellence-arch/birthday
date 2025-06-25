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
            const existingUser = await User.findOne({
              name: user.name,
              phone: user.phone,
              dob: new Date(user.dob),
            });

            if (!existingUser) {
              await User.create({
                name: user.name,
                phone: user.phone,
                dob: new Date(user.dob),
              });
              successCount++;
            } else {
              duplicateCount++;
              console.log(`Duplicate skipped: ${user.name} (${user.dob})`);
            }
          }

          resolve({ success: successCount, duplicates: duplicateCount });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};
