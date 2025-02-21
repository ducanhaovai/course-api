const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,

} = require("../controllers/authController");

// Register route
router.post("/register", register);
router.post("/verify-email", verifyEmail);

// Login route
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
