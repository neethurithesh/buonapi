const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM notifications', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const data = { ...req.body };

  // Remove id if it exists accidentally in the payload
  delete data.id;

  db.query('INSERT INTO notifications SET ?', data, (err, result) => {
    if (err) {
      console.error('Create notification error:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      id: result.insertId,
      data
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  db.query('UPDATE notifications SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM notifications WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
};