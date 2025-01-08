const express = require("express");
const router = express.Router();
const enrollmentsController = require("../controllers/enrollmentsController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/enroll", enrollmentsController.enrollUser);
router.get(
  "/status/:course_id",
  authenticateToken,
  enrollmentsController.checkEnrollmentStatus
);

router.get(
  "/user-enrollments",
  authenticateToken,
  enrollmentsController.getUserEnrollments
);

module.exports = router;
