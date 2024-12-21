const { db } = require("../config/dbConfig");

class TopCourse {
  static addTopCourse(course_id) {
    return db.query("INSERT INTO top_courses (course_id) VALUES (?)", [
      course_id,
    ]);
  }

  static removeTopCourse(course_id) {
    return db.query("DELETE FROM top_courses WHERE course_id = ?", [course_id]);
  }

  static getTopCourses() {
    return db.query(
      `
      SELECT c.*
      FROM top_courses tc
      JOIN courses c ON tc.course_id = c.id
      WHERE tc.is_active = TRUE
      `
    );
  }
}

module.exports = TopCourse;
