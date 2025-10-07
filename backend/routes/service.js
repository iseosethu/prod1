import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.js';
import { logServiceRequest } from '../controllers/serviceController.js';
import { getEngineers, createServiceRequest } from '../controllers/serviceController.js';
//import { getEngineers } from '../controllers/serviceController.js';

const router = express.Router();

router.post('/request', authenticate, authorizeRole('admin'), logServiceRequest);

router.post('/create-request', authenticate, authorizeRole('admin'), createServiceRequest);
router.get('/engineers', authenticate, authorizeRole('admin'), getEngineers);

export default router;