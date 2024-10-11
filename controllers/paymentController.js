const Payment = require("../model/Payment");

// Lấy tất cả bản ghi payments
exports.getAllPayments = async (req, res) => {
  0;
  try {
    const [rows] = await Payment.findAll();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
};

// Tìm một payment theo ID
exports.getPaymentById = async (req, res) => {
  try {
    const [rows] = await Payment.findById(req.params.id);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res
      .status(500)
      .json({ message: "Error fetching payment", error: error.message });
  }
};

// Tìm một payment theo transaction_id
exports.getPaymentByTransactionId = async (req, res) => {
  try {
    const [rows] = await Payment.findByTransaction_id(
      req.params.transaction_id
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res
      .status(500)
      .json({ message: "Error fetching payment", error: error.message });
  }
};

// Tạo một payment mới
exports.createPayment = async (req, res) => {
  const {
    enrollments_id,
    amount,
    payment_method,
    payment_status,
    transaction_id,
    payment_date,
  } = req.body;
  try {
    const [result] = await Payment.create({
      enrollments_id,
      amount,
      payment_method,
      payment_status,
      transaction_id,
      payment_date,
    });
    res.status(201).json({
      message: "Payment created successfully",
      paymentId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};

// Cập nhật một payment theo ID
exports.updatePayment = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const result = await Payment.update(id, data);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error("Error updating payment:", error);
    res
      .status(500)
      .json({ message: "Error updating payment", error: error.message });
  }
};

// Xóa một payment theo ID
exports.deletePayment = async (req, res) => {
  try {
    const result = await Payment.deleteById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res
      .status(500)
      .json({ message: "Error deleting payment", error: error.message });
  }
};

// Phân trang payments
exports.getPaymentsByPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Mặc định page=1, limit=10
  const offset = (page - 1) * limit;

  try {
    const [rows] = await Payment.findPagination(
      parseInt(offset),
      parseInt(limit)
    );
    const [total] = await Payment.countAll();
    res.json({
      payments: rows,
      total: total[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
};
