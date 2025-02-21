const { db } = require("../config/dbConfig");

class CourseSection {
  // Tạo phần học mới
  static create(data) {
    return db.query(
      "INSERT INTO course_sections (course_id, title, description, video_url, is_free , `order`) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.course_id,
        data.title,
        data.description,
        data.video_url,
        data.is_free,
        data.order,
      ]
    );
  }
  static softDelete(sectionId) {
    const sql = "UPDATE course_sections SET is_deleted = 1 WHERE id = ?";
    return db.query(sql, [sectionId]);
  }
  // Lấy tất cả các phần học theo ID của khóa học
  static findByCourseId(courseId) {
    return db.query("SELECT * FROM course_sections WHERE course_id = ?", [
      courseId,
    ]);
  }

  static async update(sectionId, data) {
    const { title, description, video_url, is_free, order } = data;
    const sql = `
      UPDATE course_sections
      SET title = ?, description = ?, video_url = ?, is_free = ?, \`order\` = ?
      WHERE id = ?
    `;
    return db.query(sql, [
      title,
      description,
      video_url,
      is_free,
      order,
      sectionId,
    ]);
  }

  // Xóa phần học theo ID
  static deleteById(id) {
    return db.query("DELETE FROM course_sections WHERE id = ?", [id]);
  }
}

module.exports = CourseSection;
