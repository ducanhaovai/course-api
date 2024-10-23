const Payment = require("../model/Payment");
const Enrollment = require("../model/Enrollments");

exports.processPayment = async (req, res) => {
  const { user_id, course_id, amount, payment_method, transaction_id } =
    req.body;

  // Check if required fields are provided
  if (!user_id || !course_id || !amount) {
    return res.status(400).json({
      message: "Missing required fields: user_id, course_id, or amount",
    });
  }

  const paymentDate = new Date();

  try {
    // Create enrollment with status 'pending'
    const [enrollmentResult] = await Enrollment.create({
      user_id,
      course_id,
      purchase_date: paymentDate,
      enrollment_status: "pending", // Set enrollment status to 'pending'
      payment_proof: null, // Assuming payment proof will be provided later
    });

    if (!enrollmentResult || !enrollmentResult.insertId) {
      console.error("Failed to create enrollment");
      return res.status(500).json({ message: "Failed to create enrollment" });
    }

    const enrollmentId = enrollmentResult.insertId; // Get the generated enrollment ID

    // Process the payment using the enrollmentId
    const payment = await Payment.create({
      enrollment_id: enrollmentId,
      amount,
      payment_method,
      transaction_id,
      payment_date: paymentDate,
      payment_status: "completed", // Assume the payment is completed
      refund_status: "not_requested", // Default refund status
      refund_amount: 0, // No refund initially
    });

    // Debugging log to check payment creation
    console.log("Payment result: ", payment);

    // Update the enrollment status to 'completed' after successful payment
    await Enrollment.update(enrollmentId, { enrollment_status: "completed" });

    return res.status(200).json({
      message: "Payment and enrollment successful",
      enrollmentId,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};
