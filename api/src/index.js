const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const reportRoutes = require('./routes/reportRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/people', personRoutes);
app.use('/api/reports', reportRoutes);

// Use force: true only in development if you want to recreate tables on every restart
// BE CAREFUL: This will delete all data.
const syncOptions = process.env.NODE_ENV === 'development' ? { force: false } : { alter: false };

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
