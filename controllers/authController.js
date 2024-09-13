const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateToken } = require("../utils/helpers");

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, first_name, last_name, role } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await User.findByEmail(email);
    if (existingUser.length) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(password, salt);

    // Create a new user
    await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      role,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [user] = await User.findByEmail(email);
    if (!user.length) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = generateToken(user[0]);

    // Send the token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
