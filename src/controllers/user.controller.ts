import { Request, Response } from 'express';
import User from '../models/user.model';

const createBirthday = async (req: Request, res: Response) => {
  try {
    const { name, phone, dob } = req.body;

    if (!name || !phone || !dob) {
      res
        .status(400)
        .json({ error: 'Name, phone, and dob are required' });
      return;
    }

    const user = new User({
      name,
      phone,
      dob: new Date(dob),
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
    return;
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};


const getAllBirthdays = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
    return;
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
    return;
  }
};

export { createBirthday, getAllBirthdays };