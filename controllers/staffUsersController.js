const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM staff_users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const data = req.body;
  const id = uuidv4();
 db.query('INSERT INTO staff_users SET ?', data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, ...data });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  db.query('UPDATE staff_users SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM staff_users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
};
