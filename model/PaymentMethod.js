const { db } = require("../config/dbConfig");

class PaymentMethod {
  static findAll() {
    return db.query("SELECT * FROM payment_methods");
  }

  static findById(id) {
    return db.query("SELECT * FROM payment_methods WHERE id = ?", [id]);
  }
}

module.exports = PaymentMethod;
