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
const cors = require("cors");
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",              // your local Vite dev server
  "https://login-theta-mauve.vercel.app" ,   // optional: your deployed frontend
  "https://backend-test-gilt-eta.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you use cookies or auth
  })
);
app.get("/", (req, res) => res.send("Congratulation 🎉🎉! Our Express server is Running on Vercel"));
app.use('/api/users', userRoutes);
app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;

