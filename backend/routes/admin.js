import pool from '../config/db.js';
import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.js';
import { getServiceStats, createEngineer } from '../controllers/adminController.js';

const router = express.Router();

router.get('/engineers', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name FROM users WHERE role = 'engineer' ORDER BY name`);
    res.json({ engineers: result.rows });
  } catch (err) {
    console.error('Engineer fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
});

router.get('/districts', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT customer_district FROM service_requests WHERE customer_district IS NOT NULL ORDER BY customer_district`);
    res.json({ districts: result.rows.map(r => r.customer_district) });
  } catch (err) {
    console.error('District fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});


router.get('/admindashboard', authenticate, authorizeRole('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.userId}` });
});

router.get('/servicestats', authenticate, authorizeRole('admin'), getServiceStats);

// ✅ New route to create service engineer
router.post('/create-engineer', authenticate, authorizeRole('admin'), createEngineer);

export default router;