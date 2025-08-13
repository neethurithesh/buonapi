const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');


exports.getAll = (req, res) => {
  db.query('SELECT * FROM drivers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.query('SELECT * FROM drivers WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];

    try {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, name: user.full_name || user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error verifying password' });
    }
  });
};


exports.create = (req, res) => {
  const data = req.body; 
  
  if (!data.username ) {
    return res.status(400).json({ error: 'Username is required' });
  } 

  if (!data.password) {
    return res.status(400).json({ error: 'Password is required' });
  }
 
  db.query('SELECT id FROM drivers WHERE email = ?', [data.email], (err, results) => {
    if (err) { 
      return res.status(400).json({ error: err.message});
    }

    if (results.length > 0) {
     
       return res.status(500).json({ error: "Email address already registered!" });
    }
  
    const bcrypt = require('bcrypt');
    bcrypt.hash(data.password, 10, (err, hashedPassword) => {
      if (err) { 
        return res.status(500).json({ error: 'Error encrypting password' });
      }

      const driverData = {
        ...data,
        password: hashedPassword, 
      };

      db.query('INSERT INTO drivers SET ?', driverData, (err) => {
        if (err) {
         
          return res.status(500).json({ error:err.message});
        }
         
        const { password, ...responseData } = driverData;
        
        return res.status(201).json({ success: 'Successfully Registered!' });
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
