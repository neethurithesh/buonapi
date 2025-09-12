// controllers/usersController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');

const query = util.promisify(db.query).bind(db);
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'please_set_jwt_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '1d';

// GET /api/users
exports.getAll = async (req, res) => {
  try {
    const results = await query('SELECT id, username, email, full_name, phone, created_at FROM users');
    res.json(results);
  } catch (err) {
    console.error('getAll users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const rows = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, name:  user.name, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      id: user.id,
      ruser: { id: user.id, name: payload.name, email: user.email }
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/users
exports.create = async (req, res) => {
  try {
    const data = req.body || {};
    // Basic validation
    if (!data.username) return res.status(400).json({ error: 'Username is required' });
    if (!data.password) return res.status(400).json({ error: 'Password is required' });
    if (!data.email) return res.status(400).json({ error: 'Email is required' });

    // Check existing by email or username
    const existing = await query('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [data.email, data.username]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email or username already registered' });

    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    const insertData = { ...data, password: hashed };
    delete insertData.id; // do not allow client to set id

    const result = await query('INSERT INTO users SET ?', insertData);
    const insertId = result.insertId;

    // remove password from response
    delete insertData.password;
    res.status(201).json({ success: 'Successfully Registered!', id: insertId, user: insertData });
  } catch (err) {
    console.error('create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/users/:id  (supports base64 profile_image)
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

  db.query('UPDATE users SET ? WHERE id = ?', [updateData, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully', success : true });
  });
};

// GET /api/users/:id/profile-image
exports.getProfileImage = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await query('SELECT profile_image, profile_image_mime FROM users WHERE id = ? LIMIT 1', [id]);
    if (!rows.length || !rows[0].profile_image) return res.status(404).json({ error: 'No profile image found' });

    const mime = rows[0].profile_image_mime || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(rows[0].profile_image);
  } catch (err) {
    console.error('getProfileImage error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!current_password || !new_password) return res.status(400).json({ error: 'current_password and new_password are required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const rows = await query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(current_password, rows[0].password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, SALT_ROUNDS);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('remove user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
