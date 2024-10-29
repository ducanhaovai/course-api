const Enrollment = require("../model/Enrollments");
const Course = require("../model/Course");
const jwt = require("jsonwebtoken");
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
  try {
    const { course_id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decodedToken.id;

    const enrollment = await Enrollment.findEnrollmentByUserAndCourse(
      user_id,
      course_id
    );

    // Kiểm tra nếu mảng enrollment tồn tại và có phần tử đầu tiên [0][0]
    if (!enrollment || enrollment.length === 0 || !enrollment[0] || !enrollment[0][0]) {
      return res.status(200).json({
        message: "User not enrolled in this course",
        enrollmentStatus: "not_enrolled",
      });
    }

    const enrollmentStatus = enrollment[0][0].enrollment_status; // Truy cập đúng cấp mảng
    return res.status(200).json({ enrollmentStatus });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return res
      .status(500)
      .json({ message: "Failed to check enrollment status" });
  }
};

