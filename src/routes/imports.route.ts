import { Router, Request, Response } from 'express';
import { importUsersFromCSV } from '../services/csvImporter.service';
// import path from 'path';
// import fs from 'fs';
// import { transformGoogleFormsCSV } from '../services/googleFormTransform.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    // console.log(req.files)
    if (!req.files || !req.files.csv) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const csvFile: any = req.files.csv;
    // const uploadPath = path.join(__dirname, '../../uploads', csvFile.name);

    // Save the file temporarily
    // await csvFile.mv(uploadPath);

    // Import users from CSV
    const result = await importUsersFromCSV(csvFile.data);

    // Delete the temporary file
    // fs.unlinkSync(uploadPath);

    res.json({
      message: 'CSV import completed',
      imported: result.success,
      duplicates: result.duplicates,
    });
    return;
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
    return;
  }
});

//   router.post('/import/google-forms', async (req: Request, res: Response) => {
//     try {
//       if (!req.files || !req.files.csv) {
//         res.status(400).json({ error: 'No CSV file uploaded' });
//         return;
//       }

//       const csvFile = req.files.csv;
//       const uploadPath = path.join(__dirname, '../../uploads', csvFile.name);
//       const transformedPath = path.join(
//         __dirname,
//         '../../uploads',
//         `transformed_${csvFile.name}`
//       );

//       // Save the file temporarily
//       await csvFile.mv(uploadPath);

//       // Transform Google Forms CSV to our format
//       await transformGoogleFormsCSV(uploadPath, transformedPath);

//       // Import users from transformed CSV
//       const result = await importUsersFromCSV(transformedPath);

//       // Delete the temporary files
//       fs.unlinkSync(uploadPath);
//       fs.unlinkSync(transformedPath);

//       res.json({
//         message: 'Google Forms CSV import completed',
//         imported: result.success,
//         duplicates: result.duplicates,
//       });
//     } catch (err) {
//       res.status(500).json({ error: (err as Error).message });
//     }
//   });
// });

export default router;
