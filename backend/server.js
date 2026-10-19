const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const cron = require('node-cron');
require('./cron');

// import the sanitizeMiddleware
const { sanitizeMiddleware } = require("./middleware/sanitizeMiddleware")

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://paisable.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// sanitizeMiddleware
app.use(sanitizeMiddleware());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring', require('./routes/recurringTransactionRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is Running');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

cron.schedule("*/10 * * * *", async () => {
  const keepAliveUrl = process.env.KEEP_ALIVE_URL;
  if (!keepAliveUrl) {
    console.error(
      "KEEP_ALIVE_URL environment variable is not set. Skipping keep-alive ping."
    );
    return;
  }

  try {
    await axios.get(keepAliveUrl);
    console.log("Keep-alive ping sent!");
  } catch (error) {
    console.error("Keep-alive FAILED!", error.message);
  }
});

module.exports = { app, server };
