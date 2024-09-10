const express = require("express");
const Course = require("../model/Course");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await Course.findAll();
    res.json(rows);
  } catch (error) {
    console.error("Error while fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error getting courses", error: error.message });
  }
});

router.get("/search", async (req, res) => {
  const { id, title } = req.query;
  try {
    if (id) {
      const [rows] = await Course.findById(id);
      if (rows.length) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } else if (title) {
      const [rows] = await Course.findByTitle(title);
      if (rows.length) {
        res.json(rows);
      } else {
        res.status(404).json({ message: "No courses found with that title" });
      }
    } else {
      res.status(400).json({ message: "No search parameters provided" });
    }
  } catch (error) {
    console.error("Error while searching for courses:", error);
    res
      .status(500)
      .json({ message: "Error searching for courses", error: error.message });
  }
});

// POST a new course
router.post("/", async (req, res) => {
  try {
    const result = await Course.create(req.body);
    res
      .status(201)
      .json({ message: "Course created successfully", course: req.body });
  } catch (error) {
    console.error("Error creating the course:", error);
    res
      .status(500)
      .json({ message: "Error creating the course", error: error.message });
  }
});

router.put("/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const result = await Course.update(title, req.body);
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Course updated successfully",
        updatedData: req.body,
      });
    } else {
      res
        .status(404)
        .json({ message: "No changes were made or course not found" });
    }
  } catch (error) {
    console.error("Error updating the course:", error);
    res
      .status(500)
      .json({ message: "Error updating the course", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Course.deleteById(req.params.id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting the course:", error);
    res
      .status(500)
      .json({ message: "Error deleting the course", error: error.message });
  }
});

router.get("/pagination", async (req, res) => {
  let { offset, limit } = req.query;

  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10);

  // Validate the parameters to ensure they are numbers
  if (isNaN(offset) || isNaN(limit)) {
    return res.status(400).json({ message: "Invalid offset or limit" });
  }

  try {
    const [rows] = await Course.findPagination(offset, limit);
    const [[{ total }]] = await Course.countAll();
    const totalPages = Math.ceil(total / limit);

    res.json({
      offset,
      limit,
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error while fetching paginated courses:", error);
    res
      .status(500)
      .json({
        message: "Error getting paginated courses",
        error: error.message,
      });
  }
});

module.exports = router;
