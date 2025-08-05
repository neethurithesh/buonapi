const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM drivers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};


exports.create = async (req, res) => {
  const data = req.body;
  const id = uuidv4();

  try {
   
    db.query('SELECT * FROM drivers WHERE email = ?', [data.email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

     
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const newDriver = {
        ...data,
        password: hashedPassword
      };

      
      db.query('INSERT INTO drivers SET ?', newDriver, (err) => {
        if (err) return res.status(500).json({ error: err.message });

         
        const { password, ...driverData } = newDriver;
        res.status(201).json(driverData);
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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
