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

  static async update(contentId, data) {
    const { content_type, content_url, title, description, order_index } = data;
    const sql = `
      UPDATE course_content
      SET content_type = ?, content_url = ?, title = ?, description = ?, order_index = ?
      WHERE id = ?
    `;
    return db.query(sql, [
      content_type,
      content_url,
      title,
      description,
      order_index,
      contentId,
    ]);
  }

  static deleteById(id) {
    return db.query("DELETE FROM course_content WHERE id = ?", [id]);
  }
}

module.exports = CourseContent;
