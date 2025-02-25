const { db } = require("../config/dbConfig");
const slugify = require("slugify");

class Course {
  static async findAll() {
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
              'order', course_sections.\`order\`,
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

  static async findNameById(id) {
    const [rows] = await db.query("SELECT title FROM courses WHERE id = ?", [id]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
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
    return rows[0];
  }

  static async getCourseBySlug(slug) {
    const [result] = await db.query(
      `
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
              'order', course_sections.\`order\`,
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
      WHERE courses.slug = ?`,
      [slug]
    );

    if (!result.length) {
      throw new Error("Course not found");
    }

    const courseData = result[0];
    courseData.sections = JSON.parse(courseData.sections || "[]");
    return courseData;
  }

  static async findByTitle(title) {
    const [rows] = await db.query(
      `SELECT courses.*, categories.name AS name 
      FROM courses 
      LEFT JOIN categories ON courses.category_id = categories.id 
      WHERE courses.title LIKE ?`,
      [`%${title}%`]
    );
    return rows;
  }

  static create(data) {
    const slug = slugify(data.title, { lower: true, strict: true });
    return db.query(
      "INSERT INTO courses (title, description, instructor_id, price, duration, thumbnail, published_date, status, category_id, slug, detailed_description, course_content, course_features, pricing_info, requirements, top) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.title,
        data.description,
        data.instructor_id,
        data.price,
        data.duration,
        data.thumbnail,
        data.published_date || new Date(),
        data.status,
        data.category_id,
        slug,
        data.detailed_description || "",
        data.course_content || "",
        data.course_features || "",
        data.pricing_info || "",
        data.requirements || "",
        data.top || 0,
      ]
    );
  }

  static async update(courseId, data) {
    const sql = `
      UPDATE courses
      SET title = ?, description = ?, price = ?, duration = ?, category_id = ?, instructor_id = ?, status = ?, thumbnail = ?,
          detailed_description = ?, course_content = ?, course_features = ?, pricing_info = ?, requirements = ?
      WHERE id = ?
    `;
    await db.query(sql, [
      data.title,
      data.description,
      data.price,
      data.duration,
      data.category_id,
      data.instructor_id,
      data.status,
      data.thumbnail,
      data.detailed_description || "",
      data.course_content || "",
      data.course_features || "",
      data.pricing_info || "",
      data.requirements || "",
      courseId,
    ]);
    return this.findById(courseId);
  }

  static async deleteById(id) {
    try {
      await db.query(
        "DELETE FROM payments WHERE enrollment_id IN (SELECT id FROM enrollments WHERE course_id = ?)",
        [id]
      );
      await db.query("DELETE FROM enrollments WHERE course_id = ?", [id]);
      return db.query("DELETE FROM courses WHERE id = ?", [id]);
    } catch (error) {
      throw error;
    }
  }

  static async findPagination(offset, limit) {
    const [rows] = await db.query(
      `SELECT courses.*, categories.name AS name 
       FROM courses 
       LEFT JOIN categories ON courses.category_id = categories.id 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async countAll() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM courses");
    return rows[0].total;
  }

  static async getAllCategories() {
    try {
      const [rows] = await db.query("SELECT id, name FROM categories");
      return rows;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async createCate({ name }) {
    try {
      const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
      return { id: result.insertId, name };
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  static async findBySlug(slug) {
    const query = "SELECT * FROM courses WHERE slug = ?";
    const [rows] = await db.query(query, [slug]);
    return rows[0] || null;
  }
}

module.exports = Course;
