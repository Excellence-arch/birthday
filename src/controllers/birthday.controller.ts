import { Request, Response } from 'express';
import User from '../models/user.model';

export const getBirthdays = async (req: Request, res: Response) => {
  try {
    const birthdays = await User.find({ account: req.user?._id })
      .sort({ dob: 1 })
      .select('-account -__v');

    // Transform the data to include age and days until next birthday
    const transformedBirthdays = birthdays.map(birthday => {
      const dob = new Date(birthday.dob);
      return {
        ...birthday.toObject(),
        dob: dob.toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
    });

    res.json(transformedBirthdays);
    return;
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const addBirthday = async (req: Request, res: Response) => {
  try {
    const { name, phone, dob } = req.body;

    // Basic validation
    if (!name || !phone || !dob) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if(!req.user || !req.user._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate date format
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Check if date is in the future
    const today = new Date();
    if (dobDate > today) {
      res.status(400).json({ message: 'Date cannot be in the future' });
      return;
    }

    // Create new birthday
    const newBirthday = await User.create({
      name,
      phone,
      dob: dobDate,
      account: req.user._id, // From auth middleware
    });

    // Return the created birthday without sensitive/uneeded fields
    const birthdayToReturn = {
      _id: newBirthday._id,
      name: newBirthday.name,
      phone: newBirthday.phone,
      dob: newBirthday.dob,
      createdAt: newBirthday.createdAt,
    };

    res.status(201).json(birthdayToReturn);
    return;
  } catch (error: Error | any) {
    console.error('Error adding birthday:', error);

    if (error.name === 'ValidationError') {
      // Handle Mongoose validation errors
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({ message: messages.join(', ') });
      return;
    }

    res.status(500).json({ message: 'Server error' });
    return;
  }
};