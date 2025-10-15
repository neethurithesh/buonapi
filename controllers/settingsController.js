// controllers/settingsController.js
const db = require('../config/db');

function normalizeBoolean(v) {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v ? 1 : 0;
  if (typeof v === 'string') {
    const s = v.toLowerCase().trim();
    return s === 'true' || s === '1' ? 1 : 0;
  }
  return 0;
}

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    if (!rows.length) return res.json({ success: true, settings: null });
    return res.json({ success: true, settings: rows[0] });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.upsertSettings = async (req, res) => {
  try {
    // allowed fields from request
    const allowed = [
      'company_name','email','phone','address','timezone','currency',
      'base_fare','per_km_rate',
      'email_notifications','sms_notifications','auto_assign_drivers','allow_cancellation',
      'mapbox_token','google_maps_api_key','stripe_secret_key',
      'twilio_account_sid','twilio_auth_token','twilio_phone_number',
      'smtp_host','smtp_port','smtp_username','smtp_password','smtp_from_email'
    ];

    const payload = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) payload[key] = req.body[key];
    }
    return res.status(400).json({ success: false, error: 'Test' });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided' });
    }

    // normalize boolean / numeric fields
    if ('email_notifications' in payload) payload.email_notifications = normalizeBoolean(payload.email_notifications);
    if ('sms_notifications' in payload) payload.sms_notifications = normalizeBoolean(payload.sms_notifications);
    if ('auto_assign_drivers' in payload) payload.auto_assign_drivers = normalizeBoolean(payload.auto_assign_drivers);
    if ('allow_cancellation' in payload) payload.allow_cancellation = normalizeBoolean(payload.allow_cancellation);

    if ('base_fare' in payload) payload.base_fare = payload.base_fare === null ? null : Number(payload.base_fare);
    if ('per_km_rate' in payload) payload.per_km_rate = payload.per_km_rate === null ? null : Number(payload.per_km_rate);
    if ('smtp_port' in payload) payload.smtp_port = payload.smtp_port === null ? null : Number(payload.smtp_port);

    // Check if a settings row exists
    const [existing] = await db.promise().query('SELECT id FROM settings ORDER BY id DESC LIMIT 1');

    if (existing.length === 0) {
      // Insert
      const [result] = await db.promise().query('INSERT INTO settings SET ?', payload);
      const id = result.insertId;
      const [rows] = await db.promise().query('SELECT * FROM settings WHERE id = ? LIMIT 1', [id]);
      return res.status(201).json({ success: true, settings: rows[0] });
    } else {
      // Update the latest settings row (or you can update by id if desired)
      const id = existing[0].id;
      await db.promise().query('UPDATE settings SET ? WHERE id = ?', [payload, id]);
      const [rows] = await db.promise().query('SELECT * FROM settings WHERE id = ? LIMIT 1', [id]);
      return res.json({ success: true, settings: rows[0] });
    }
  } catch (err) {
    console.error('upsertSettings error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
