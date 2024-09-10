const db = require("../config/dbConfig");

class Course {
  static findAll() {
    return db.query("SELECT * FROM courses");
  }
  static findById(id) {
    return db.query("SELECT * FROM courses WHERE id = ?", [id]);
  }

  static findByTitle(title) {
    return db.query("SELECT * FROM courses WHERE title LIKE ?", [`%${title}%`]);
  }
  static create(data) {
    return db.query(
      "INSERT INTO courses (title, description, instructor, price, duration, category, level, language, thumbnail, published_date, status, rating, total_enrollments, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.title,
        data.description,
        data.instructor,
        data.price,
        data.duration,
        data.category,
        data.level,
        data.language,
        data.thumbnail,
        data.published_date,
        data.status,
        data.rating,
        data.total_enrollments,
        data.pdf_url,
      ]
    );
  }

  static update(title, data) {
    let query = "UPDATE courses SET ";
    let parameters = [];
    let updates = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        parameters.push(value);
      }
    }

    query += updates.join(", ") + " WHERE LOWER(title) = LOWER(?)";
    parameters.push(title);

    if (updates.length > 0) {
      return db.query(query, parameters).then((result) => result[0]);
    } else {
      return Promise.resolve({ affectedRows: 0 });
    }
  }

  static deleteById(id) {
    return db.query("DELETE FROM courses WHERE id = ?", [id]);
  }
  static findPagination(offset, limit) {
    return db.query("SELECT * FROM courses LIMIT ? OFFSET ?", [limit, offset]);
  }
  static countAll() {
    return db.query("SELECT COUNT(*) AS total FROM courses");
  }
}

module.exports = Course;
