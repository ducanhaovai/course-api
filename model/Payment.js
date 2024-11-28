const { db } = require("../config/dbConfig");

class Payment {
  static create(data) {
    return db.query(
      "INSERT INTO payments (enrollment_id, amount, payment_method_id, payment_status, transaction_id, payment_date, refund_status, refund_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.enrollment_id,
        data.amount,
        data.payment_method_id,
        data.payment_status,
        data.transaction_id,
        data.payment_date,
        data.refund_status,
        data.refund_amount,
      ]
    );
  }

  static findByEnrollmentId(enrollment_id) {
    return db.query("SELECT * FROM payments WHERE enrollment_id = ?", [
      enrollment_id,
    ]);
  }

  static update(id, data) {
    return db.query(
      "UPDATE payments SET amount = ?, payment_status = ?, refund_status = ?, refund_amount = ?, updated_at = NOW() WHERE id = ?",
      [
        data.amount,
        data.payment_status,
        data.refund_status,
        data.refund_amount,
        id,
      ]
    );
  }
}

module.exports = Payment;
