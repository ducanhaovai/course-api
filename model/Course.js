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
      "INSERT INTO courses (title, description, instructor_id, price, duration,  thumbnail, published_date, status,  pdf_url , category_id) VALUES (?,  ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.title,
        data.description,
        data.instructor_id,
        data.price,
        data.duration,
        data.thumbnail,
        data.published_date,
        data.status,
        data.pdf_url,
        data.category_id,
      ]
    );
  }

  static update(id, data) {
    let query = "UPDATE courses SET ";
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
