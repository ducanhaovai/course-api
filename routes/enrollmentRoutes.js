const express = require("express");
const router = express.Router();
const enrollmentsController = require("../controllers/enrollmentsController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/enroll", enrollmentsController.enrollUser);
router.get("/status/:slug", authenticateToken, enrollmentsController.checkEnrollmentStatus);

router.get(
  "/user-enrollments",
  authenticateToken,
  enrollmentsController.getUserEnrollments
);

module.exports = router;
