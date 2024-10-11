const db = require("../config/dbConfig");

class Enrollments {
  static findAll() {
    return db.query("SELECT * FROM enrollments");
  }
  static findById(id) {
    return db.query("SELECT * FROM enrollments WHERE id = ?", [id]);
  }

  static create(data) {
    return db.query(
      "INSERT INTO enrollments (user_id, course_id, status, payment_proof) VALUES (?,?,?,?)",
      [data.user_id, data.course_id, data.status, data.payment_proof]
    );
  }

  static update(id, data) {
    let query = "UPDATE enrollments SET ";
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
    return db.query("DELETE FROM enrollments WHERE id = ?", [id]);
  }
  static findPagination(offset, limit) {
    return db.query("SELECT * FROM enrollments LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
  }
  static countAll() {
    return db.query("SELECT COUNT(*) AS total FROM enrollments");
  }
}

module.exports = Enrollments;
