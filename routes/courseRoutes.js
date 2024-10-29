const express = require("express");
const courseController = require("../controllers/courseController");
const router = express.Router();

// Các endpoint khác
router.get("/", courseController.getCourse);
router.get("/:id", courseController.getCourseID);
router.get("/search", courseController.getCourseSearch);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
router.get("/category/:category", courseController.searchCategory);
router.get("/pagination", courseController.paginationCourse);
router.post("/course-sections", courseController.createCourseWithSections);

module.exports = router;
