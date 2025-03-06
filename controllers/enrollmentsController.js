const Enrollment = require("../model/Enrollments");
const Course = require("../model/Course");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const Notification = require("../model/Notification");
const mongoose = require("mongoose");
exports.enrollUser = async (req, res) => {
  const { user_id, course_id } = req.body;

  try {
    const result = await Enrollment.create({
      user_id,
      course_id,
      purchase_date: new Date(),
      enrollment_status: "pending",
      payment_proof: null,
    });

    const courseDetails = await Course.findById(course_id);
    if (!courseDetails) {
      console.error("Course not found for ID:", course_id);
      return res.status(404).json({ message: "Course not found" });
    }
    const user = await User.findById(user_id);
    if (!user) {
      console.error("User not found for ID:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    const admins = await User.findAllByRole(1);

    for (const admin of admins) {
      if (admin && admin.id) {
        await Notification.create({
          sender_id: user_id,
          target_user_id: admin.id,
          message: `Người dùng ${user.email} đã đăng ký tham gia khóa học ${courseDetails.title}`,
          notification_type: "course_enrollment",
        });
        io.to(admin.id.toString()).emit("newEnrollment", {
          sender_id: user_id,
          course_id,
          message: `User ${user.email} has enrolled in course ${courseDetails.name}`,
        });
      } else {
        console.error("Invalid admin object:", admin);
      }
    }

    return res.status(200).json({
      message: "User enrolled successfully",
      enrollmentId: result._id,
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
    const { slug } = req.params; // lấy slug từ URL
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decodedToken.id;

    // Tìm khóa học theo slug
    const course = await Course.findBySlug(slug);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        enrollmentStatus: "not_enrolled",
      });
    }

    // Lấy course id từ course tìm được
    const course_id = course.id;

    // Gọi model Enrollment để kiểm tra đăng ký
    const [rows] = await Enrollment.findEnrollmentByUserAndCourse(user_id, course_id);
    if (!rows || rows.length === 0) {
      return res.status(200).json({
        message: "User not enrolled in this course",
        enrollmentStatus: "not_enrolled",
      });
    }

    const enrollmentStatus = rows[0].enrollment_status;
    return res.status(200).json({ enrollmentStatus });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return res.status(500).json({
      message: "Failed to check enrollment status",
    });
  }
};
exports.getUserEnrollments = async (req, res) => {
  const user_id = req.user.id;

  try {
    const enrollments = await Enrollment.findAllByUser(
      user_id,
      "course_enrollment"
    );
    res.json(enrollments);
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
};
