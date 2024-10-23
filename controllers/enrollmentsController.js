const Enrollment = require("../model/Enrollments");
const Course = require("../model/Course");

exports.enrollUser = async (req, res) => {
  const { user_id, course_id } = req.body;
  const purchaseDate = new Date();
  const enrollment_status = "pending";
  const payment_proof = null;

  try {
    const result = await Enrollment.create({
      user_id,
      course_id,
      purchase_date: purchaseDate,
      enrollment_status,
      payment_proof,
    });

    const enrollmentId = result.insertId;
    const [courseDetails] = await Course.findById(course_id);

    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "User enrolled successfully",
      enrollmentId,
      courseDetails,
    });
  } catch (error) {
    console.error("Error during enrollment:", error);
    return res.status(500).json({
      message: "Error enrolling user",
      error: error.message,
    });
  }
};
exports.checkEnrollmentStatus = async (req, res) => {
  const { user_id, course_id } = req.params;

  try {
    const enrollment = await Enrollment.findEnrollmentByUserAndCourse(
      user_id,
      course_id
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: "User not enrolled." });
    }

    const enrollmentStatus = enrollment[0].enrollment_status;

    if (enrollmentStatus !== "completed") {
      return res
        .status(403)
        .json({
          message: "Enrollment is pending or canceled.",
          enrollmentStatus,
        });
    }

    return res
      .status(200)
      .json({ message: "User is enrolled in this course.", enrollmentStatus });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return res
      .status(500)
      .json({ message: "Failed to check enrollment status." });
  }
};
