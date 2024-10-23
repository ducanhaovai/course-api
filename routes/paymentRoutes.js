const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Process payment after the user checks out
router.post("/payment", paymentController.processPayment);

module.exports = router;
