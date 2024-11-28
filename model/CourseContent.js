const { db } = require("../config/dbConfig");

class CourseContent {
  static findAll() {
    return db.query("SELECT * FROM course_content");
  }

  static findBySectionId(sectionId) {
    return db.query("SELECT * FROM course_content WHERE section_id = ?", [
      sectionId,
    ]);
  }

  static findById(id) {
    return db.query("SELECT * FROM course_content WHERE id = ?", [id]);
  }

  static create(data) {
    return db.query(
      "INSERT INTO course_content (course_id, section_id, content_type, content_url, title, description, order_index) VALUES ( ?,?, ?, ?, ?, ?, ?)",
      [
        data.course_id,
        data.section_id,
        data.content_type,
        data.content_url,
        data.title,
        data.description,
        data.order_index,
      ]
    );
  }

  static update(id, data) {
    let query = "UPDATE course_content SET ";
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
    return db.query("DELETE FROM course_content WHERE id = ?", [id]);
  }
}

module.exports = CourseContent;
