const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);


router.get("/admin/users", protect, adminOnly, adminController.getUsers);
router.put(
  "/admin/users/:id",
  protect,
  adminOnly,
  adminController.updateUserRole
);

module.exports = router;
