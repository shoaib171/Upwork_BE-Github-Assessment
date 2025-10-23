require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const integrationRoutes = require('./routes/integrations');
const dataRoutes = require('./routes/data');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());

// connect mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=> console.log('Mongo connected'))
  .catch(err => { console.error('Mongo connection error', err); process.exit(1); });

// routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/data', dataRoutes);

// health
app.get('/api/health', (req,res) => res.json({ok:true, time: new Date()}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));
