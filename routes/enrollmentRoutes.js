const express = require("express");
const router = express.Router();
const enrollmentsController = require("../controllers/enrollmentsController");

router.post("/enroll", enrollmentsController.enrollUser);
router.get(
  "/status/:user_id/:course_id",
  enrollmentsController.checkEnrollmentStatus
);
module.exports = router;
