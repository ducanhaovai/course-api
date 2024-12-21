const TopCourse = require("../model/TopCourse");

const addTopCourse = async (req, res) => {
  const { course_id } = req.body;

  try {
    await TopCourse.addTopCourse(course_id);
    res
      .status(201)
      .json({ message: "Course added to top courses successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add course to top courses" });
  }
};

const removeTopCourse = async (req, res) => {
  const { course_id } = req.body;

  try {
    await TopCourse.removeTopCourse(course_id);
    res
      .status(200)
      .json({ message: "Course removed from top courses successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove course from top courses" });
  }
};

const getTopCourses = async (req, res) => {
  try {
    const topCourses = await TopCourse.getTopCourses();
    res.status(200).json({ topCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch top courses" });
  }
};

module.exports = { addTopCourse, removeTopCourse, getTopCourses };
