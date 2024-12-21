const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

router.post("/create", authenticateUser, notificationController.createNotification);

router.get(
  "/user/:userId",
  authenticateUser,
  notificationController.getUserNotifications
);

// Lấy tất cả thông báo
router.get("/all", authenticateUser, notificationController.getAllNotifications);
module.exports = router;
