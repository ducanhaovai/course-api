const Course = require("../model/Course");

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const {
    title,
    description,
    price,
    duration,
    category,
    level,
    instructor_id,
    status,
    pdf_url,
  } = req.body;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await course.update({
      title,
      description,
      price,
      duration,
      category,
      level,
      instructor_id,
      status,
      pdf_url,
    });

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};
