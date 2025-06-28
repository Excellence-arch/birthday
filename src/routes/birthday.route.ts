import express from 'express';
import authenticate  from '../middlewares/auth.middleware';
import {
  getBirthdays,
  addBirthday,
  // getBirthdayById,
  // updateBirthday,
  // deleteBirthday,
} from '../controllers/birthday.controller';

const router = express.Router();

// Protected routes
router.get('/', authenticate, getBirthdays);
router.post('/', authenticate, addBirthday);
// router.get('/:id', authenticate, getBirthdayById);
// router.put('/:id', authenticate, updateBirthday);
// router.delete('/:id', authenticate, deleteBirthday);

export default router;
