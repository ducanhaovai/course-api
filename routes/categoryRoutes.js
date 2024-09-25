const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isAdmin } = require("../middleware/authMiddleware");

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", isAdmin, categoryController.updateCategory);
router.delete("/:id", isAdmin, categoryController.deleteCategory);

module.exports = router;
