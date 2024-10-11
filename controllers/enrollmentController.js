// File: controllers/enrollmentController.js
const Enrollment = require("../model/Enrollments");

// Lấy tất cả bản ghi enrollments
exports.getAllEnrollments = async (req, res) => {
  try {
    const [rows] = await Enrollment.findAll();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
};

// Tìm một enrollment theo ID
exports.getEnrollmentById = async (req, res) => {
  try {
    const [rows] = await Enrollment.findById(req.params.id);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res
      .status(500)
      .json({ message: "Error fetching enrollment", error: error.message });
  }
};

// Tạo một enrollment mới
exports.createEnrollment = async (req, res) => {
  const { user_id, id, status, payment_proof } = req.body;
  try {
    const [result] = await Enrollment.create({
      user_id,
      id,
      status,
      payment_proof,
    });
    res
      .status(201)
      .json({
        message: "Enrollment created successfully",
        enrollmentId: result.insertId,
      });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    res
      .status(500)
      .json({ message: "Error creating enrollment", error: error.message });
  }
};

// Cập nhật một enrollment theo ID
exports.updateEnrollment = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const result = await Enrollment.update(id, data);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json({ message: "Enrollment updated successfully" });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    res
      .status(500)
      .json({ message: "Error updating enrollment", error: error.message });
  }
};

// Xóa một enrollment theo ID
exports.deleteEnrollment = async (req, res) => {
  try {
    const result = await Enrollment.deleteById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    res
      .status(500)
      .json({ message: "Error deleting enrollment", error: error.message });
  }
};

// Phân trang enrollments
exports.getEnrollmentsByPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Mặc định page=1, limit=10
  const offset = (page - 1) * limit;

  try {
    const [rows] = await Enrollment.findPagination(
      parseInt(offset),
      parseInt(limit)
    );
    const [total] = await Enrollment.countAll();
    res.json({
      enrollments: rows,
      total: total[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
};
