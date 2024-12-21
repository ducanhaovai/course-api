const { db } = require("../config/dbConfig");

class Notification {
  static create(data) {
    return db.query(
      "INSERT INTO notifications (sender_id, target_user_id, message, created_at) VALUES (?, ?, ?, ?)",
      [data.sender_id, data.target_user_id, data.message, new Date()]
    );
  }

  static findByUserId(target_user_id) {
    return db.query(
      "SELECT * FROM notifications WHERE target_user_id = ? ORDER BY created_at DESC",
      [target_user_id]
    );
  }

  static findAll() {
    return db.query("SELECT * FROM notifications ORDER BY created_at DESC");
  }
}

module.exports = Notification;
