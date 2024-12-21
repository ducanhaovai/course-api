const Enrollment = require("../model/Enrollments");
const Course = require("../model/Course");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const Notification = require("../model/Notification");
const mongoose = require("mongoose");
exports.enrollUser = async (req, res) => {
  const { user_id, course_id } = req.body;

  try {
    console.log(
      `Starting enrollment for user ${user_id} to course ${course_id}`
    );
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

    const admins = await User.findAllByRole(1);
    console.log(
      "Admins fetched for notification:",
      admins.map((a) => a.id)
    );

    for (const admin of admins) {
      if (admin && admin.id) {
        console.log(`Processing notification for admin ${admin.id}`);
        const newNotification = new Notification({
          sender_id: user_id,
          target_role: 1,
          target_user_id: admin.id,
          course_id,
          message: `Người dùng ${user_id} đã đăng ký tham gia khóa học ${course_id}`,
        });

        const savedNotification = await newNotification.save();
        io.to(admin.id.toString()).emit("newEnrollment", savedNotification);
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
    const { course_id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decodedToken.id;

    const enrollment = await Enrollment.findEnrollmentByUserAndCourse(
      user_id,
      course_id
    );

    if (
      !enrollment ||
      enrollment.length === 0 ||
      !enrollment[0] ||
      !enrollment[0][0]
    ) {
      return res.status(200).json({
        message: "User not enrolled in this course",
        enrollmentStatus: "not_enrolled",
      });
    }

    const enrollmentStatus = enrollment[0][0].enrollment_status;
    return res.status(200).json({ enrollmentStatus });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return res
      .status(500)
      .json({ message: "Failed to check enrollment status" });
  }
};
