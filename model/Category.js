const db = require("../config/dbConfig");

class Category {
  static findAll() {
    return db.query("SELECT * FROM categories");
  }
  static findById(id) {
    return db.query("SELECT * FROM categories WHERE id = ?", [id]);
  }

  static create(data) {
    return db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [data.name, data.description]
    );
  }

  static update(id, data) {
    return db.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [data.name, data.description, id]
    );
  }
  static delete(id) {
    return db.query("DELETE FROM categories WHERE id = ?", [id]);
  }
}

module.exports = Category;
