const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Process payment after the user checks out
router.post("/create", paymentController.createOrGetPaymentReference);

router.post("/cancel", paymentController.cancelPayment);
router.post("/confirm", paymentController.confirmPayment);
router.post("/verify", paymentController.verifyPayment);
module.exports = router;
