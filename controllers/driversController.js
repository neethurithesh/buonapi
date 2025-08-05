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
  console.log('Incoming request:', data);
  
  if (!data.username || !data.password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT id FROM drivers WHERE email = ?', [data.username], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.log('Email is unique, proceeding to hash password...');

    const bcrypt = require('bcrypt');
    bcrypt.hash(data.password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Error encrypting password' });
      }

      const driverData = {
        ...data,
        password: hashedPassword
      };

      db.query('INSERT INTO drivers SET ?', driverData, (err) => {
        if (err) {
          console.error('Error inserting driver:', err);
          return res.status(500).json({ error: err.message });
        }

        const { password, ...responseData } = driverData;
        console.log('Driver created successfully:', responseData);
        res.status(201).json(responseData);
      });
    });
  });
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
