const db = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');


exports.getAll = (req, res) => {
  db.query('SELECT * FROM drivers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const secretKey = 'buon_by_nka';
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM drivers WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    const user = results[0];
     
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ id: user.id, name: user.name }, secretKey, { expiresIn: '1d' });
    res.json({ token , id: user.id, driver:{id: user.id, name: user.name, email:user.email}});
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


//exports.update = (req, res) => {
 // const id = req.params.id;
 // db.query('UPDATE drivers SET ? WHERE id = ?', [req.body, id], (err) => {
  //  if (err) return res.status(500).json({ error: err.message });
   // res.json({ message: 'Updated successfully' });
  //});
//};

exports.update = (req, res) => {
  const id = req.params.id;
  const body = { ...req.body };

  // Build update payload from non-image fields
  const updateData = { ...body };
  delete updateData.profile_image_base64;
  delete updateData.profile_image_mime;
  delete updateData.id;

  // Handle base64 -> Buffer (optional)
  if (body.profile_image_base64) {
    // Support both data URLs and raw base64
    let base64 = body.profile_image_base64;
    let mime = body.profile_image_mime || null;

    const dataUrlMatch = /^data:(.+);base64,(.*)$/i.exec(base64);
    if (dataUrlMatch) {
      mime = dataUrlMatch[1];              // e.g. image/png
      base64 = dataUrlMatch[2];            // strip the prefix
    }

    // Basic mime allowlist (extend as needed)
    const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (mime && !allowed.has(mime)) {
      return res.status(400).json({ error: 'Unsupported image type. Allowed: png, jpeg, webp' });
    }

    // Decode
    let buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    // Optional size limit (2MB)
    const MAX = 2 * 1024 * 1024;
    if (buffer.length > MAX) {
      return res.status(413).json({ error: 'Image too large (max 2MB)' });
    }

    // Assign to update payload
    updateData.profile_image = buffer;
    if (mime) updateData.profile_image_mime = mime;
  }

  // No fields provided?
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  db.query('UPDATE drivers SET ? WHERE id = ?', [updateData, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
};

/**
 * Streams the stored image
 * GET /api/drivers/:id/profile-image
 */
exports.getProfileImage = (req, res) => {
  const id = req.params.id;
  db.query(
    'SELECT profile_image, profile_image_mime FROM drivers WHERE id = ? LIMIT 1',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length || !rows[0].profile_image) {
        return res.status(404).json({ error: 'No profile image found' });
      }
      const mime = rows[0].profile_image_mime || 'application/octet-stream';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.end(rows[0].profile_image); // Buffer -> response
    }
  );
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM drivers WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
};
