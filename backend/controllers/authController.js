import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export async function register(req, res) {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Store password as-is (plaintext)
    const user = await createUser({ name, email, password, role });

    res.status(201).json({ message: 'User registered', userId: user.id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export function logout(req, res) {
  res.json({ message: 'Logout handled on frontend by clearing token' });
}