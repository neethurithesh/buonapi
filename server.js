const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/staff-users', require('./routes/staffUsers'));
app.use('/api/pricing-options', require('./routes/pricingOptions'));
app.use('/api/banner-images', require('./routes/bannerImages'));
app.use('/api/promo-codes', require('./routes/promoCodes'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/vehicle-types', require('./routes/vehicleTypes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));