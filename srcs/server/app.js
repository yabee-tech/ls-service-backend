// this is the web server initialization file
// import required libraries and instansiate express app
const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// import routes
const bookingRoutes = require('./routes/bookings');
const repairRoutes = require('./routes/repair');
const feedbackRoutes = require('./routes/feedback');
const technicianRoutes = require('./routes/technician');
const authRoutes = require('./routes/auth');

// json middleware
app.use(express.json());

// logging
app.use(morgan('combined'));

// routes
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/repairs', repairRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/technicians', technicianRoutes);
app.use('/api/v1/auth', authRoutes);

// 404 route
app.get('*', (req, res) => {
  res.status(404).json({ status: 404, error: 'URL not found' });
});

app.listen(port, () => {
  console.log(`Server up and running at port ${port}`);
});
