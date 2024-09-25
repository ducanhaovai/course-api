const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const {
  updateUserRole,
  getUsers,
  updateUser,
  deleteUser,
  getInstructors,
} = require("../controllers/adminController");
const { logout } = require("../controllers/authController");

const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.role !== 1) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

router.put("/users/role/:id", isAdmin, updateUser);
router.put("/users/info/:id", isAdmin, updateUser);
router.delete("/users/delete/:id", isAdmin, deleteUser);
router.get("/users", isAdmin, getUsers);
router.get("/logout", isAdmin, logout);
router.get("/instructors", isAdmin, getInstructors);
module.exports = router;
