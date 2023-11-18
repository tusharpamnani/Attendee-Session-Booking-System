const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// Import authentication and session controllers
const { register, login, logout } = require("./Controllers/authController");
const {
  getFreeSessions,
  bookSession,
  getPendingSessions,
  addSessions,
} = require("./Controllers/sessionController");

// Middleware for authenticating JWT tokens
const authenticateToken = (req, res, next) => {
  const str = req.headers["authorization"];
  const token = str.split(" ")[1];
  console.log("Received Token:", token);

  // Check if token is present in the request headers
  if (!token) {
    console.log("Token not present");
    return res.sendStatus(401);
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.SECRETKEY, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// API Endpoints
// Endpoint for warden registration
app.post("/warden/register", register);
// Endpoint for warden login
app.post("/warden/login", login);
// Endpoint to add hardcoded sessions (protected by authentication)
app.post("/sessions/add", authenticateToken, addSessions);
// Endpoint to get free sessions (protected by authentication)
app.get("/sessions/free", authenticateToken, getFreeSessions);
// Endpoint to book a session (protected by authentication)
app.post("/sessions/book", authenticateToken, bookSession);
// Endpoint to get pending sessions for a warden (protected by authentication)
app.get("/sessions/pending", authenticateToken, getPendingSessions);
// Endpoint for warden logout (protected by authentication)
app.post("/warden/logout", authenticateToken, logout);

// Start the server
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
