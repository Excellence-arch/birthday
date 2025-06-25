import express from 'express';
import User from '../models/user.model';
import { createBirthday, getAllBirthdays } from '../controllers/user.controller';

const router = express.Router();

// Create a new user
router.post('/', createBirthday);

// Get all users (for testing)
router.get('/', getAllBirthdays);

export default router;