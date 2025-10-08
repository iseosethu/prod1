import pool from '../config/db.js';
//import redisClient from '../config/redis.js';

export async function logServiceRequest(req, res) {
  const { customer_name, customer_mobile, vehicle_type, issue_description } = req.body;

  // 1. Get all engineers with sufficient balance
  const commission = vehicle_type === 'car' ? 500 : 300;
  const engineers = await pool.query(
    'SELECT u.id, s.balance FROM users u JOIN engineer_subscription s ON u.id = s.engineer_id WHERE u.role = $1 AND s.balance >= $2 ORDER BY s.balance DESC',
    ['engineer', commission]
  );

  if (engineers.rows.length === 0) {
    return res.status(400).json({ error: 'No engineer available with sufficient balance' });
  }

  const engineer = engineers.rows[0];

  // 2. Deduct commission
  await pool.query(
    'UPDATE engineer_subscription SET balance = balance - $1 WHERE engineer_id = $2',
    [commission, engineer.id]
  );

  // 3. Insert service request
  const result = await pool.query(
    `INSERT INTO service_requests (customer_name, customer_mobile, vehicle_type, issue_description, assigned_engineer_id, commission_amount)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [customer_name, customer_mobile, vehicle_type, issue_description, engineer.id, commission]
  );

  // 4. Trigger Redis alert if balance < 500
//  const updatedBalance = engineer.balance - commission;
//  if (updatedBalance < 500) {
//    await redisClient.publish('low_balance_alerts', JSON.stringify({
//      engineer_id: engineer.id,
//      balance: updatedBalance
//    }));
//  }

  res.status(201).json({ message: 'Service request logged and engineer assigned', requestId: result.rows[0].id });
}

export async function createServiceRequest(req, res) {
  const {
    customer_name,
    customer_mobile,
    vehicle_type,
    vehicle_model,
    registration_no,
    issue_description,
    assigned_engineer_id,
    customer_district,
    customer_address
  } = req.body;

  const commission = vehicle_type === 'car' ? 500 : 300;

  try {
    // Deduct commission from engineer's balance
    await pool.query(
      `UPDATE engineer_subscription
       SET balance = balance - $1
       WHERE engineer_id = $2`,
      [commission, assigned_engineer_id]
    );

    // ✅ Corrected: 10 columns, 10 values, 10 placeholders
    const result = await pool.query(
      `INSERT INTO service_requests (
        customer_name, customer_mobile, vehicle_type,
        vehicle_model, registration_no, issue_description,
        assigned_engineer_id, commission_amount,
        customer_district, customer_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        customer_name,
        customer_mobile,
        vehicle_type,
        vehicle_model,
        registration_no,
        issue_description,
        assigned_engineer_id,
        commission,
        customer_district,
        customer_address
      ]
    );

    res.status(201).json({ message: 'Service request created', requestId: result.rows[0].id });
  } catch (err) {
    console.error('Service request creation error:', err);
    res.status(500).json({ error: 'Failed to create service request' });
  }
}

export async function getEngineers(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name FROM users WHERE role = $1 ORDER BY name',
      ['engineer']
    );
    res.json({ engineers: result.rows });
  } catch (err) {
    console.error('Error fetching engineers:', err);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
}