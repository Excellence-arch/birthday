// routes/dashboard.route.ts
import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import authenticate from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getDashboardData);

export default router;
