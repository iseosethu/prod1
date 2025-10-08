import pool from '../config/db.js';

export async function createUser({ name, email, password, role }) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, password, role]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}