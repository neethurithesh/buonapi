const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM drivers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const data = req.body; 
  if (!data.username ) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  if (!data.password) {
    return res.status(400).json({ error: 'Password is required' });
  }
 res.status(400).json({ error: 'test' });
 
};


exports.update = (req, res) => {
  const id = req.params.id;
  db.query('UPDATE drivers SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM drivers WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
};
