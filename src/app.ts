import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/user.route';
import connectDB from './config/db';
import checkBirthdays from './services/scheduler.service';
import importRoutes from './routes/imports.route';
import authRoutes from './routes/auth.route';
import 'dotenv/config';
import dashboardRoutes from './routes/dashboard.route';
import birthdayRoutes from './routes/birthday.route';
import fileUpload from 'express-fileupload';

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded (max 5MB)',
    useTempFiles: false, // Process directly from memory
  })
);

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/import', importRoutes);
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Birthday API' });
  return;
});

// Start birthday checker
checkBirthdays();

export default app;
