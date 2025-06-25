import nodemailer from 'nodemailer';
import 'dotenv/config';
import User from '../models/user.model';
import { IUser } from '../interfaces/IUser.interface';

if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.EMAIL_TO
) {
  throw new Error('Email configuration is missing in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBirthdayReminder = async (user: IUser): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `Birthday Reminder: ${user.name}'s birthday is coming up!`,
    text: `Birthday Reminder: ${
      user.name
    }'s birthday is in 2 days (on ${user.dob.toDateString()}). 
    Contact: ${user.phone}`,
    html: `
      <h1>Birthday Reminder</h1>
      <p><strong>${
        user.name
      }</strong>'s birthday is in 2 days (on ${user.dob.toDateString()}).</p>
      <p>Contact: ${user.phone}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent for ${user.name}`);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};
