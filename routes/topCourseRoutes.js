const express = require("express");
const {
  addTopCourse,
  removeTopCourse,
  getTopCourses,
} = require("../controllers/topCourseController");

const router = express.Router();

router.post("/add", addTopCourse);
router.post("/remove", removeTopCourse);
router.get("/", getTopCourses);

module.exports = router;
