const Course = require("../model/Course");
const CourseSections = require("../model/CourseSection");
const CourseContent = require("../model/CourseContent");

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const {
    title,
    description,
    price,
    duration,
    category,
    instructor_id,
    status,
    pdf_url,
  } = req.body;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await course.update({
      title,
      description,
      price,
      duration,
      category,
      instructor_id,
      status,
      pdf_url,
    });

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};
exports.getCourse = async (req, res) => {
  try {
    const [rows] = await Course.findAll();
    const formattedCourses = rows.map((course) => ({
      ...course,
      sections: course.sections ? JSON.parse(course.sections) : [],
    }));
    res.json(formattedCourses);
  } catch (error) {
    console.error("Error while fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error getting courses", error: error.message });
  }
};
exports.getCourseID = async (req, res) => {
  const courseId = req.params.id;
  try {
    if (!courseId) {
      return res.status(400).json({ message: "No search parameters provided" });
    }

    // Lấy thông tin cơ bản của khóa học
    const [courseRows] = await Course.findById(courseId);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseData = courseRows[0];

    const [sectionRows] = await CourseSections.findByCourseId(courseId);

    for (const section of sectionRows) {
      const [contentRows] = await CourseContent.findBySectionId(section.id);
      section.contents = contentRows;
    }

    courseData.sections = sectionRows;

    res.json(courseData);
  } catch (error) {
    console.error("Error while fetching course details:", error);
    res
      .status(500)
      .json({ message: "Error fetching course details", error: error.message });
  }
};
exports.getCourseBySlug = async (req, res) => {
  const slug = req.params.slug;
  try {
    const [rows] = await Course.findBySlug(slug);
    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.error("Error while fetching course by slug:", error);
    res
      .status(500)
      .json({ message: "Error fetching course", error: error.message });
  }
};
exports.getCourseSearch = async (req, res) => {
  const { id, title } = req.query;
  try {
    if (id) {
      const [rows] = await Course.findById(id);
      if (rows.length) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } else if (title) {
      const [rows] = await Course.findByTitle(title);
      if (rows.length) {
        res.json(rows);
      } else {
        res.status(404).json({ message: "No courses found with that title" });
      }
    } else {
      res.status(400).json({ message: "No search parameters provided" });
    }
  } catch (error) {
    console.error("Error while searching for courses:", error);
    res
      .status(500)
      .json({ message: "Error searching for courses", error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const result = await Course.create(req.body);
    res
      .status(201)
      .json({ message: "Course created successfully", course: req.body });
  } catch (error) {
    console.error("Error creating the course:", error);
    res
      .status(500)
      .json({ message: "Error creating the course", error: error.message });
  }
};

exports.createCourseWithSections = async (req, res) => {
  const {
    title,
    description,
    price,
    duration,
    category_id,
    instructor_id,
    status,
    pdf_url,
    thumbnail,
    sections,
  } = req.body;

  try {
    const statusValue = status === "active" ? 1 : 0;
    // Tạo khóa học mới
    const [courseResult] = await Course.create({
      title,
      description,
      price,
      duration,
      category_id,
      instructor_id,
      status: statusValue,
      pdf_url,
      thumbnail,
    });

    const courseId = courseResult.insertId || courseResult.id;
    if (!courseId) {
      return res
        .status(500)
        .json({ message: "Failed to create course. `course_id` is null." });
    }

    if (sections && sections.length > 0) {
      for (const section of sections) {
        const [sectionResult] = await CourseSections.create({
          course_id: courseId, // Truyền `courseId` vào khi tạo section
          title: section.title,
          description: section.description,
          video_url: section.video_url,
          is_free: section.is_free,
          order: section.order,
        });

        const sectionId = sectionResult.insertId;

        // Tạo nội dung (content) cho từng phần (section)
        if (section.contents && section.contents.length > 0) {
          for (const content of section.contents) {
            await CourseContent.create({
              course_id: courseId,
              section_id: sectionId,
              content_type: content.content_type,
              content_url: content.content_url,
              title: content.title,
              description: content.description,
              order_index: content.order_index,
            });
          }
        }
      }
    }

    res
      .status(201)
      .json({ message: "Course with sections created successfully!" });
  } catch (error) {
    console.error("Error creating course with sections:", error);
    res.status(500).json({
      message: "Error creating course with sections",
      error: error.message,
    });
  }
};
exports.updateCourse = async (req, res) => {
  const title = req.params.title;

  try {
    const result = await Course.update(title, req.body);
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Course updated successfully",
        updatedData: req.body,
      });
    } else {
      res
        .status(404)
        .json({ message: "No changes were made or course not found" });
    }
  } catch (error) {
    console.error("Error updating the course:", error);
    res
      .status(500)
      .json({ message: "Error updating the course", error: error.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const result = await Course.deleteById(req.params.id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting the course:", error);
    res
      .status(500)
      .json({ message: "Error deleting the course", error: error.message });
  }
};
exports.paginationCourse = async (req, res) => {
  let { offset, limit } = req.query;

  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10);

  if (isNaN(offset) || isNaN(limit)) {
    return res.status(400).json({ message: "Invalid offset or limit" });
  }

  try {
    const [rows] = await Course.findPagination(offset, limit);
    const [[{ total }]] = await Course.countAll();
    const totalPages = Math.ceil(total / limit);

    res.json({
      offset,
      limit,
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error while fetching paginated courses:", error);
    res.status(500).json({
      message: "Error getting paginated courses",
      error: error.message,
    });
  }
};

exports.searchCategory = async (req, res) => {
  const category = req.params.category;
  try {
    const [rows] = await db.query(
      "SELECT * FROM courses WHERE category LIKE ?",
      [`%${category}%`]
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        data: rows,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No courses found for this category",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses by category",
      error: error.message,
    });
  }
};
