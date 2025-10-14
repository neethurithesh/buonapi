// controllers/cabController.js
const db = require('../config/db'); // must export mysql2 pool
// Example: const pool = mysql.createPool(...); module.exports = pool;

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.getCabOptions = async (req, res) => {
  try {
    const { pickup, destination } = req.body || {};

    if (!pickup || !destination) {
      return res.status(400).json({ success: false, error: 'pickup and destination required' });
    }

    const pLat = Number(pickup.lat);
    const pLng = Number(pickup.lng);
    const dLat = Number(destination.lat);
    const dLng = Number(destination.lng);

    

    if (
      Number.isNaN(pLat) ||
      Number.isNaN(pLng) ||
      Number.isNaN(dLat) ||
      Number.isNaN(dLng)
    ) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

    const distanceKm = haversineDistanceKm(pLat, pLng, dLat, dLng);
    // Optional: estimate duration in minutes (assume avg speed e.g. 30 km/h)
    const estMinutes = Math.max(1, Math.round((distanceKm / 30) * 60)); // crude estimate

    return res.status(400).json({ success: false, error: estMinutes });

    // Join pricing_options with vehicle_types to get vehicle info
    const sql = `
      SELECT
        p.id AS pricing_id,
        p.vehicle_type_id,
        p.base_fare,
        p.per_km_rate,
        p.per_minute_rate,
        p.minimum_fare,
        p.maximum_fare,
        vt.name AS vehicle_name,
        vt.description AS vehicle_description,
        vt.image AS vehicle_image
      FROM pricing_options p
      LEFT JOIN vehicle_types vt ON vt.id = p.vehicle_type_id
      WHERE p.active IS NULL OR p.active = 1
    `;

    // using mysql2 promise interface
    const [rows] = await db.promise().query(sql);

    const options = rows.map((r) => {
      const baseFare = Number(r.base_fare || 0);
      const perKm = Number(r.per_km_rate || 0);
      const perMin = Number(r.per_minute_rate || 0);
      const minimumFare = r.minimum_fare != null ? Number(r.minimum_fare) : null;
      const maximumFare = r.maximum_fare != null ? Number(r.maximum_fare) : null;

      // price calculation
      let price = baseFare + perKm * distanceKm + perMin * estMinutes;
      if (minimumFare != null) price = Math.max(price, minimumFare);
      if (maximumFare != null) price = Math.min(price, maximumFare);

      // round to 2 decimals
      price = Math.round(price * 100) / 100;

      return {
        pricing_id: r.pricing_id,
        vehicle_type_id: r.vehicle_type_id,
        vehicle_type: {
          id: r.vehicle_type_id,
          name: r.vehicle_name,
          description: r.vehicle_description,
          image: r.vehicle_image,
        },
        pricing: {
          base_fare: baseFare,
          per_km_rate: perKm,
          per_minute_rate: perMin,
          minimum_fare: minimumFare,
          maximum_fare: maximumFare,
        },
        distance_km: Number(distanceKm.toFixed(2)),
        estimated_minutes: estMinutes,
        price,
        eta: `${Math.max(1, Math.round(2 + Math.random() * 6))} mins` // simple ETA
      };
    });

    res.json({ success: true, pickup, destination, options });
  } catch (err) {
    console.error('getCabOptions error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
