import pool from '../config/db.js';

export async function getServiceStats(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { vehicle_type, engineer_id, district } = req.query;

  const filters = [];
  const values = [limit, offset];
  let whereClause = '';

  if (vehicle_type) {
    filters.push(`sr.vehicle_type = $${values.length + 1}`);
    values.push(vehicle_type);
  }
  if (engineer_id) {
    filters.push(`sr.assigned_engineer_id = $${values.length + 1}`);
    values.push(engineer_id);
  }
  if (district) {
    filters.push(`sr.customer_district ILIKE $${values.length + 1}`);
    values.push(`%${district}%`);
  }

  if (filters.length > 0) {
    whereClause = 'WHERE ' + filters.join(' AND ');
  }

  try {
    const result = await pool.query(`
      SELECT sr.id, sr.customer_name, sr.customer_mobile,
             sr.vehicle_type, sr.vehicle_model, sr.registration_no,
             sr.issue_description, sr.customer_district, sr.customer_address,
             sr.commission_amount, sr.created_at,
             u.name AS engineer_name
      FROM service_requests sr
      JOIN users u ON sr.assigned_engineer_id = u.id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $1 OFFSET $2
    `, values);

    const countResult = await pool.query(`SELECT COUNT(*) FROM service_requests`);
    const totalRevenueResult = await pool.query(`SELECT SUM(commission_amount) FROM service_requests`);
    const totalRevenue = parseInt(totalRevenueResult.rows[0].sum) || 0;

    res.json({
      totalRevenue,
      totalCount: parseInt(countResult.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
      requests: result.rows
    });
  } catch (err) {
    console.error('Error fetching service stats:', err);
    res.status(500).json({ error: 'Failed to fetch service stats' });
  }
}

export async function createEngineer(req, res) {
  const { name, email, password, phone, service_area, deposit } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Engineer already exists' });
    }

    // Insert into users
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, service_area) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, password, phone, 'engineer', service_area]
    );

    const engineerId = userResult.rows[0].id;

    // Insert into engineer_subscription
    await pool.query(
      'INSERT INTO engineer_subscription (engineer_id, balance) VALUES ($1, $2)',
      [engineerId, deposit]
    );

    res.status(201).json({ message: 'Engineer created', engineerId });
  } catch (err) {
    console.error('Engineer creation error:', err);
    res.status(500).json({ error: 'Failed to create engineer' });
  }
}

