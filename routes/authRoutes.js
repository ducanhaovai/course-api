const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
