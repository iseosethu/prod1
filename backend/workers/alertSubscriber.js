import redisClient from '../config/redis.js';

async function startAlertListener() {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe('low_balance_alerts', (message) => {
    const alert = JSON.parse(message);
    console.log(`⚠️ Engineer ${alert.engineer_id} has low balance: ₹${alert.balance}`);
    // Optional: store in DB or send email/SMS
  });
}

startAlertListener();