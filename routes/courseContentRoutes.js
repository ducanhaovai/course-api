const express = require("express");
const router = express.Router();
const courseContentController = require("../controllers/courseContentController");

router.get("/", courseContentController.getAllContent);
router.get("/:sectionId", courseContentController.getContentBySectionId);

module.exports = router;
