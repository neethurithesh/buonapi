const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM vehicle_types', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const data = req.body;
  const id = uuidv4();
  db.query('INSERT INTO vehicle_types SET id = ?, ?', [id, data], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, ...data });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  db.query('UPDATE vehicle_types SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM vehicle_types WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
};