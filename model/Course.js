const db = require("../config/dbConfig");
const slugify = require("slugify");
class Course {
  static findAll() {
    return db.query(`
      SELECT 
        courses.*,
        categories.name AS category_name, 
        users.first_name AS instructor_first_name, 
        users.last_name AS instructor_last_name,
        COALESCE(enrollment_counts.total_enrollments, 0) AS total_enrollments,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', course_sections.id,
              'title', course_sections.title,
              'description', course_sections.description,
              'video_url', IFNULL(course_sections.video_url, ''),
              'is_free', course_sections.is_free,
              'order', course_sections.order,
              'content', IFNULL((
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', course_content.id,
                    'title', course_content.title,
                    'description', course_content.description,
                    'content_type', course_content.content_type,
                    'content_url', course_content.content_url,
                    'order_index', course_content.order_index
                  )
                )
                FROM course_content
                WHERE course_content.section_id = course_sections.id
              ), JSON_ARRAY())
            )
          )
          FROM course_sections 
          WHERE course_sections.course_id = courses.id
        ) AS sections
      FROM 
        courses
      LEFT JOIN categories ON courses.category_id = categories.id
      LEFT JOIN users ON courses.instructor_id = users.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) AS total_enrollments
        FROM enrollments
        GROUP BY course_id
      ) AS enrollment_counts ON enrollment_counts.course_id = courses.id
    `);
  }

  static findById(id) {
    return db.query(
      `SELECT 
          courses.*, 
          categories.name AS category_name, 
          users.first_name AS instructor_first_name, 
          users.last_name AS instructor_last_name, 
          (SELECT COUNT(*) FROM course_sections WHERE course_sections.course_id = courses.id) AS total_sections,
          (SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = courses.id) AS total_enrollments
       FROM courses 
       LEFT JOIN categories ON courses.category_id = categories.id 
       LEFT JOIN users ON courses.instructor_id = users.id 
       WHERE courses.id = ?`,
      [id]
    );
  }

  static findByTitle(title) {
    `SELECT courses.*, categories.name AS name 
    FROM courses 
    LEFT JOIN categories ON courses.category_id = categories.id 
    WHERE courses.title LIKE ?`,
      [`%${title}%`];
  }
  static create(data) {
    const slug = slugify(data.title, { lower: true, strict: true });
    return db.query(
      "INSERT INTO courses (title, description, instructor_id, price, duration,  thumbnail, published_date, status,  pdf_url , category_id, slug) VALUES (?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        slug,
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
    `SELECT courses.*, categories.name AS name 
       FROM courses 
       LEFT JOIN categories ON courses.category_id = categories.id 
       LIMIT ? OFFSET ?`,
      [limit, offset];
  }
  static countAll() {
    return db.query("SELECT COUNT(*) AS total FROM courses");
  }
}

module.exports = Course;
