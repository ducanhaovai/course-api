const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

// Order matters: place specific routes before general ones
router.get("/", courseController.getCourse);
router.get("/basic", courseController.getCourseBasic);
router.get("/search", courseController.getCourseSearch);
router.get("/category", courseController.getCategories);
router.get("/pagination", courseController.paginationCourse);
router.get("/course-sections", courseController.createCourseWithSections);

// Specific routes for slug and ID
router.get("/:slug", courseController.getCourseBySlug);
router.get("/:id", courseController.getCourseID);

// CRUD routes
router.post("/add-category", courseController.addCategory);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
router.get("/category/:category", courseController.searchCategory);
router.get("/pagination", courseController.paginationCourse);
router.post("/course-sections", courseController.createCourseWithSections);
module.exports = router;
    