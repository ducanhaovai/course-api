// controllers/paymentController.js
const Payment = require("../model/Payment");
const Enrollment = require("../model/Enrollments");
function generateRandomCode() {
  // Tạo mã ngẫu nhiên 8 ký tự
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Endpoint tạo hoặc lấy payment đang pending
exports.createOrGetPaymentReference = async (req, res) => {
  console.log("createOrGetPaymentReference - Request body:", req.body);
  try {
    const { user_id, course_id, amount } = req.body;
    if (!user_id || !course_id || !amount) {
      console.error("Missing required fields in createOrGetPaymentReference");
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra nếu đã có payment pending cho user+course
    let payment = await Payment.findPending(user_id, course_id);

    if (!payment) {
      console.log("No pending payment found. Creating new payment.");
      const referenceCode = generateRandomCode();
      const result = await Payment.create({
        user_id,
        course_id,
        enrollment_id: null,
        amount,

        payment_status: "pending",
        transaction_id: null,
        reference_code: referenceCode,
        payment_date: null,
        refund_status: null,
        refund_amount: null,
      });
      const insertedId = result.insertId;
      payment = await Payment.findById(insertedId);
      console.log(`Payment created with id: ${insertedId} and reference_code: ${referenceCode}`);
    } else {
      console.log(`Existing pending payment found with id: ${payment.id}`);
    }

    return res.json({ success: true, payment });
  } catch (error) {
    console.error("Error in createOrGetPaymentReference:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Endpoint hủy payment (xoá payment khỏi DB)
exports.cancelPayment = async (req, res) => {
  console.log("cancelPayment - Request body:", req.body);
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      console.error("cancelPayment - Missing paymentId");
      return res.status(400).json({ success: false, message: "Thiếu paymentId" });
    }
    await Payment.deletePayment(paymentId);
    console.log(`Payment ${paymentId} cancelled successfully.`);
    return res.json({ success: true, message: "Payment cancelled" });
  } catch (error) {
    console.error("Error in cancelPayment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Endpoint xác nhận payment (người dùng đã chuyển tiền)
exports.confirmPayment = async (req, res) => {
  console.log("confirmPayment - Request body:", req.body);
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      console.error("confirmPayment - Missing paymentId");
      return res.status(400).json({ success: false, message: "Missing paymentId" });
    }
    // Cập nhật trạng thái payment thành "completed" (theo schema mới)
    await Payment.update(paymentId, { payment_status: "completed" });
    console.log(`Payment ${paymentId} updated to 'completed'.`);
    return res.json({ success: true, message: "Payment confirmed by user." });
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.verifyPayment = async (req, res) => {
  console.log("verifyPayment - Request body:", req.body);
  try {
    const { paymentId, paymentProof } = req.body;
    if (!paymentId) {
      console.error("verifyPayment - Missing paymentId");
      return res.status(400).json({ success: false, message: "Missing paymentId" });
    }
    // Cập nhật trạng thái payment thành "done" khi admin xác minh
    await Payment.update(paymentId, { payment_status: "done" });
    console.log(`Payment ${paymentId} updated to 'done' (admin verified).`);

    // Lấy thông tin payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.error("verifyPayment - Payment not found");
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Kiểm tra xem enrollment cho user và course đã tồn tại hay chưa
    const [existingEnrollments] = await Enrollment.findEnrollmentByUserAndCourse(payment.user_id, payment.course_id);
    if (existingEnrollments && existingEnrollments.length > 0) {
      // Nếu đã có enrollment, cập nhật trạng thái thành "complete"
      const enrollmentId = existingEnrollments[0].id;
      await Enrollment.update(enrollmentId, {
        enrollment_status: "complete",
        payment_proof: paymentProof || null,
      });
      console.log(`Enrollment ${enrollmentId} updated to 'complete'.`);
    } else {
      // Nếu chưa có enrollment, tạo mới enrollment với trạng thái "complete"
      const enrollmentData = {
        user_id: payment.user_id,
        course_id: payment.course_id,
        purchase_date: new Date(), // hoặc sử dụng payment.payment_date nếu có
        enrollment_status: "complete",
        payment_proof: paymentProof || null,
      };
      const [newEnrollment] = await Enrollment.create(enrollmentData);
      console.log(`New enrollment created for user ${payment.user_id} in course ${payment.course_id} with status 'complete'.`);
    }

    return res.json({
      success: true,
      message: "Payment verified and enrollment granted.",
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};