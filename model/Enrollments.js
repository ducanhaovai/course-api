const db = require("../config/dbConfig");

class Enrollment {
  static create(data) {
    return db.query(
      "INSERT INTO enrollments (user_id, course_id, purchase_date, enrollment_status, payment_proof) VALUES (?, ?, ?, ?, ?)",
      [
        data.user_id,
        data.course_id,
        data.purchase_date,
        data.enrollment_status,
        data.payment_proof,
      ]
    );
  }

  static findEnrollmentByUserAndCourse(user_id, course_id) {
    return db.query(
      "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
      [user_id, course_id]
    );
  }

  static update(enrollmentId, data) {
    return db.query(
      "UPDATE enrollments SET enrollment_status = ?, payment_proof = ? WHERE id = ?",
      [data.enrollment_status, data.payment_proof, enrollmentId]
    );
  }
}

module.exports = Enrollment;
