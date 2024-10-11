const db = require("../config/dbConfig");

class Payment {
  static findAll() {
    return db.query("SELECT * FROM payments");
  }
  static findById(id) {
    return db.query("SELECT * FROM payments WHERE id = ?", [id]);
  }

  static findByTransaction_id(transaction_id) {
    return db.query("SELECT * FROM payments WHERE transaction_id LIKE ?", [
      `%${transaction_id}%`,
    ]);
  }
  static create(data) {
    return db.query(
      "INSERT INTO payments ( enrollments_id, amount,payment_method,payment_status,transaction_id, payment_date   ) VALUES (?,?,?,?,?,?)",
      [
        data.enrollments_id,
        data.amount,
        data.payment_method,
        data.payment_status,
        data.transaction_id,
        data.payment_date,
      ]
    );
  }

  static update(id, data) {
    let query = "UPDATE payments SET ";
    let parameters = [];
    let updates = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        parameters.push(value);
      }
    }

    query += updates.join(", ") + " WHERE id = ?";
    parameters.push(id);

    if (updates.length > 0) {
      return db.query(query, parameters).then((result) => result[0]);
    } else {
      return Promise.resolve({ affectedRows: 0 });
    }
  }

  static deleteById(id) {
    return db.query("DELETE FROM payments WHERE id = ?", [id]);
  }
  static findPagination(offset, limit) {
    return db.query("SELECT * FROM payments LIMIT ? OFFSET ?", [limit, offset]);
  }
  static countAll() {
    return db.query("SELECT COUNT(*) AS total FROM payments");
  }
}

module.exports = Payment;
