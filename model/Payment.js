// model/Payment.js
const { db } = require("../config/dbConfig");

class Payment {
  // Tạo mới payment
  static async create(data) {
    const query = `
      INSERT INTO payments 
        (user_id, course_id, enrollment_id, amount, payment_status, transaction_id, reference_code, payment_date, refund_status, refund_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.user_id,
      data.course_id,
      // Nếu enrollment_id chưa có thì có thể dùng giá trị mặc định (ví dụ: 0) hoặc NULL (nếu bảng cho phép NULL)
      data.enrollment_id !== undefined ? data.enrollment_id : 0,
      data.amount,
      data.payment_status,
      data.transaction_id || null,
      data.reference_code,
      data.payment_date || null,
      data.refund_status || null,
      data.refund_amount || null,
    ];
    const [result] = await db.query(query, values);
    return result;
  }

  // Tìm payment theo id và trả về đối tượng (row) duy nhất
  static async findById(id) {
    const query = "SELECT * FROM payments WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
  }

  // Tìm payment pending theo user và course và trả về đối tượng duy nhất
  static async findPending(user_id, course_id) {
    const query = `
      SELECT * FROM payments 
      WHERE user_id = ? AND course_id = ? AND payment_status = 'pending'
      LIMIT 1
    `;
    const [rows] = await db.query(query, [user_id, course_id]);
    return rows[0] || null;
  }

  // Cập nhật thông tin payment (ở đây chỉ cập nhật trạng thái, nhưng bạn có thể mở rộng)
  static async update(id, data) {
    const query = `
      UPDATE payments 
      SET payment_status = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    await db.query(query, [data.payment_status, id]);
  }

  // Xoá payment theo id
  static async deletePayment(id) {
    const query = "DELETE FROM payments WHERE id = ?";
    await db.query(query, [id]);
  }
  static async getExpiredPendingPayments(expiredTime) {
    const query = `
      SELECT id FROM payments 
      WHERE payment_status = 'pending' AND created_at < ?
    `;
    const [rows] = await db.query(query, [expiredTime]);
    return rows;
  }
}

module.exports = Payment;
