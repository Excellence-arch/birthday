// import fs from 'fs';
// import csv from 'csv-parser';
// import { ICsvUser } from '../interfaces/ICsvUser.interface';

// export const transformGoogleFormsCSV = (
//   inputPath: string,
//   outputPath: string
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     const results: ICsvUser[] = [];

//     fs.createReadStream(inputPath)
//       .pipe(csv())
//       .on('data', (data: any) => {
//         // Transform Google Forms data to our format
//         // Adjust these mappings based on your actual Google Forms fields
//         results.push({
//           name: data['What is your name?'] || data['Name'] || '',
//           phone: data['What is your phone number?'] || data['Phone'] || '',
//           dob:
//             data['What is your date of birth?'] || data['Date of Birth'] || '',
//         });
//       })
//       .on('end', () => {
//         // Write transformed data to new CSV
//         const csvData = [
//           ['name', 'phone', 'dob'], // headers
//           ...results.map((user) => [user.name, user.phone, user.dob]),
//         ]
//           .map((row) => row.join(','))
//           .join('\n');

//         fs.writeFile(outputPath, csvData, (err) => {
//           if (err) reject(err);
//           else resolve();
//         });
//       })
//       .on('error', (err) => reject(err));
//   });
// };
