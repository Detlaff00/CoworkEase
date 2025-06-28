
const cron = require('node-cron');
const pool = require('./db');  // ваш модуль с подключением к PostgreSQL

// расписание: каждую минуту
cron.schedule('* * * * *', async () => {
  try {
    await pool.query(`
      UPDATE bookings
         SET status = 'completed'
       WHERE status = 'active'
         AND (booking_date < CURRENT_DATE
              OR (booking_date = CURRENT_DATE AND end_time < CURRENT_TIME));
    `);
    console.log('[Scheduler] Обновлены просроченные брони.');
  } catch (err) {
    console.error('[Scheduler] Ошибка при обновлении брони:', err);
  }
}, {
  timezone: 'Europe/Amsterdam'
});
