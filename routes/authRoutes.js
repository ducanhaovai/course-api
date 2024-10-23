const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
} = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);
router.post("/logout", logout);
router.post("/token/refresh", refreshToken);
module.exports = router;
