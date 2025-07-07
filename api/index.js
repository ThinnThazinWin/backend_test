// api/index.js

// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('../config/db');
// const userRoutes = require('../routes/userRoutes');
// const serverless = require('serverless-http');

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());
// app.use('/api/users', userRoutes);

// // Don't call app.listen
// module.exports.handler = serverless(app);

const dotenv = require('dotenv')
const connectDB = require('../config/db')
const userRoutes = require('../routes/userRoutes');
const express = require("express");
dotenv.config();
connectDB();
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Congratulation 🎉🎉! Our Express server is Running on Vercel"));
app.use('/api/users', userRoutes);
app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;

