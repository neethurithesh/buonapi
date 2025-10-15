// controllers/settingsController.js
const db = require('../config/db');

/**
 * GET /api/settings
 * Optional query params:
 *  - category: filter by category
 *  - public: true/false to filter by is_public
 */
exports.getAll = async (req, res) => {
  try {
    const { category, is_public } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (typeof is_public !== 'undefined') {
      // accept "true" / "false" or "1"/"0"
      const val = String(is_public).toLowerCase();
      const bool = val === 'true' || val === '1' ? 1 : 0;
      conditions.push('is_public = ?');
      params.push(bool);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, setting_key, value, description, category, is_public, created_at, updated_at FROM settings ${where} ORDER BY id DESC`;
    const [rows] = await db.promise().query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('settings.getAll error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * POST /api/settings
 * Body: { setting_key, value, description?, category?, is_public? }
 */
exports.create = async (req, res) => {
  try {
    const { setting_key, value, description, category, is_public } = req.body;

    // check unique key
    const [exists] = await db.promise().query('SELECT id FROM settings WHERE setting_key = ? LIMIT 1', [setting_key]);
    if (exists.length) return res.status(409).json({ success: false, error: 'Setting key already exists' });

    const insertData = {
      setting_key,
      value: value ?? null,
      description: description ?? null,
      category: category ?? 'general',
      is_public: typeof is_public === 'undefined' ? 0 : (is_public ? 1 : 0)
    };

    const [result] = await db.promise().query('INSERT INTO settings SET ?', insertData);
    const id = result.insertId;

    res.status(201).json({ success: true, id, setting: { id, ...insertData } });
  } catch (err) {
    console.error('settings.create error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * PUT /api/settings/:id
 * Body: any of { setting_key, value, description, category, is_public }
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = { ...req.body };

    // Do not allow empty update
    if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });

    // If setting_key is being updated, check uniqueness
    if (payload.setting_key) {
      const [existing] = await db.promise().query('SELECT id FROM settings WHERE setting_key = ? AND id != ? LIMIT 1', [payload.setting_key, id]);
      if (existing.length) return res.status(409).json({ success: false, error: 'Another setting with this key already exists' });
    }

    // Normalize boolean
    if (typeof payload.is_public !== 'undefined') {
      payload.is_public = payload.is_public ? 1 : 0;
    }

    await db.promise().query('UPDATE settings SET ? WHERE id = ?', [payload, id]);
    res.json({ success: true, message: 'Updated successfully' });
  } catch (err) {
    console.error('settings.update error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * DELETE /api/settings/:id
 */
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.promise().query('DELETE FROM settings WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('settings.remove error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
