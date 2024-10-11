const CourseSection = require("../model/CourseSection");

exports.getAllSections = async (req, res) => {
  try {
    const sections = await CourseSection.findAll();
    res.json(sections);
  } catch (error) {
    console.error("Error fetching course sections:", error);
    res.status(500).json({
      message: "Error fetching course sections",
      error: error.message,
    });
  }
};

exports.getSectionsByCourseId = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const sections = await CourseSection.findByCourseId(courseId);
    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections by course ID:", error);
    res.status(500).json({
      message: "Error fetching sections by course ID",
      error: error.message,
    });
  }
};
