
const db = require('../config/db');

exports.getStats = (req, res) => {
  const stats = {};
  db.query('SELECT COUNT(*) AS count FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.users = result[0].count;
    db.query('SELECT COUNT(*) AS count FROM drivers', (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      stats.drivers = result2[0].count;
      db.query('SELECT COUNT(*) AS count FROM bookings', (err3, result3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        stats.bookings = result3[0].count;
        res.json(stats);
      });
    });
  });
};
