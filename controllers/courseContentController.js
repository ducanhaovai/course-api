const CourseContent = require("../model/CourseContent");

exports.getAllContent = async (req, res) => {
  try {
    const content = await CourseContent.findAll();
    res.json(content);
  } catch (error) {
    console.error("Error fetching course content:", error);
    res
      .status(500)
      .json({ message: "Error fetching course content", error: error.message });
  }
};

exports.getContentBySectionId = async (req, res) => {
  const sectionId = req.params.sectionId;
  try {
    const content = await CourseContent.findBySectionId(sectionId);
    res.json(content);
  } catch (error) {
    console.error("Error fetching content by section ID:", error);
    res.status(500).json({
      message: "Error fetching content by section ID",
      error: error.message,
    });
  }
};
