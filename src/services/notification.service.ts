import nodemailer from 'nodemailer';
import 'dotenv/config';
import { IUser } from '../interfaces/IUser.interface';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('Email configuration is missing in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendBirthdayReminder = async (
  account: any,
  birthdays: any[]
): Promise<void> => {
  // Sort birthdays by days until (1-day first, then 2-day)
  birthdays.sort((a, b) => a.daysUntil - b.daysUntil);

  const multipleBirthdays = birthdays.length > 1;
  const subject = multipleBirthdays
    ? `🎂 ${birthdays.length} birthdays coming up!`
    : `🎂 ${birthdays[0].user.name}'s birthday is ${
        birthdays[0].daysUntil === 1 ? 'tomorrow' : 'in 2 days'
      }!`;

  const birthdayItems = birthdays.map((birthday) => {
    const formattedDate = new Date(birthday.user.dob).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }
    );

    return {
      name: birthday.user.name,
      daysText: birthday.daysUntil === 1 ? 'tomorrow' : 'in 2 days',
      date: formattedDate,
      phone: birthday.user.phone || '',
      isTomorrow: birthday.daysUntil === 1,
    };
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #ff6b6b;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
        }
        .birthday-icon {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
          color: #ff6b6b;
        }
        .birthday-item {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .birthday-item h3 {
          margin-top: 0;
          color: #ff6b6b;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Birthday Reminder</h1>
      </div>
      
      <div class="content">
        <div class="birthday-icon">${multipleBirthdays ? '🎂🎂' : '🎂'}</div>
        
        <h2>${
          multipleBirthdays
            ? `You have ${birthdays.length} birthdays coming up!`
            : `${birthdayItems[0].name}'s birthday is ${birthdayItems[0].daysText}!`
        }</h2>
        
        ${birthdayItems
          .map(
            (item) => `
          <div class="birthday-item">
            <h3>${item.name}'s birthday is ${item.daysText}</h3>
            <p><strong>Date:</strong> ${item.date}</p>
            ${item.phone ? `<p><strong>Phone:</strong> ${item.phone}</p>` : ''}
            ${
              item.isTomorrow
                ? `<p>🎁 <strong>Last chance</strong> to get a gift ready!</p>`
                : `<p>⏰ You still have time to plan something special.</p>`
            }
          </div>
        `
          )
          .join('')}
        
        <a href="#" class="cta-button">Set Reminders</a>
      </div>
      
      <div class="footer">
        <p>You're receiving this email because you signed up for birthday reminders.</p>
        <p><a href="#">Unsubscribe</a> | <a href="#">Manage Preferences</a></p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Birthday Reminder
    ================
    
    ${
      multipleBirthdays
        ? `You have ${birthdays.length} birthdays coming up!`
        : `${birthdayItems[0].name}'s birthday is ${birthdayItems[0].daysText}!`
    }
    
    ${birthdayItems
      .map(
        (item) => `
    --------------------------
    ${item.name}'s birthday is ${item.daysText} (${item.date})
    ${item.phone ? `Contact: ${item.phone}` : ''}
    ${
      item.isTomorrow
        ? 'Last chance to get a gift ready!'
        : 'You still have time to plan something special.'
    }
    `
      )
      .join('')}
    
    --------------------------
    Don't forget to send your wishes!
  `;

  const mailOptions = {
    from: `"Birthday Reminder" <${process.env.EMAIL_USER}>`,
    to: account.email,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Sent reminder for ${birthdays.length} birthday(s) to ${account.email}`
    );
  } catch (err) {
    console.error('Error sending email:', err);
  }
};