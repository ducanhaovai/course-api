const express = require("express");
const router = express.Router();
const courseSectionController = require("../controllers/courseSectionController");

router.get("/", courseSectionController.getAllSections);
router.get("/:courseId", courseSectionController.getSectionsByCourseId);

module.exports = router;
