const express = require("express");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

router.get("/", paymentController.getAllPayments);
router.get("/:id", paymentController.getPaymentById);
router.get(
  "/transaction/:transaction_id",
  paymentController.getPaymentByTransactionId
);
router.post("/", paymentController.createPayment);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);
router.get("/pagination", paymentController.getPaymentsByPagination);

module.exports = router;
