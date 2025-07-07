// api/index.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const userRoutes = require('../routes/userRoutes');
const serverless = require('serverless-http');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Don't call app.listen
module.exports.handler = serverless(app);
