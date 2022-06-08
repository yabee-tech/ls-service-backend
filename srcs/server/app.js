// this is the web server initialization file
// import required libraries and instansiate express app
const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// import routes
const bookingRoutes = require('./routes/bookings');
const repairRoutes = require('./routes/repair');
const feedbackRoutes = require('./routes/feedback');

// json middleware
app.use(express.json());

// routes
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/repairs', repairRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);

// 404 route
app.get('*', (req, res) => {
  res.status(404).json({ status: 404, error: 'URL not found' });
});

app.listen(port, () => {
  console.log(`Server up and running at port ${port}`);
});
