const db = require("../config/dbConfig");

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

  // Lấy tất cả các phần học theo ID của khóa học
  static findByCourseId(courseId) {
    return db.query("SELECT * FROM course_sections WHERE course_id = ?", [
      courseId,
    ]);
  }

  // Cập nhật phần học
  static update(id, data) {
    let query = "UPDATE course_sections SET ";
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

  // Xóa phần học theo ID
  static deleteById(id) {
    return db.query("DELETE FROM course_sections WHERE id = ?", [id]);
  }
}

module.exports = CourseSection;
