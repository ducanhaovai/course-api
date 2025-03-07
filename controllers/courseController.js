const Course = require("../model/Course");
const CourseSections = require("../model/CourseSection");
const CourseContent = require("../model/CourseContent");
const fs = require('fs');
const slugify = require('slugify');
const path = require('path');
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
exports.getCourseBasic = async (req, res) => {
  try {
    const [rows] = await Course.findAllBasic();
    res.json(rows);
  } catch (error) {
    console.error("Error while fetching basic courses:", error);
    res.status(500).json({ message: "Error getting courses", error: error.message });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const categories = await Course.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Error fetching categories" });
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
  try {
    const { slug } = req.params;
    const course = await Course.getCourseBySlug(slug);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error while fetching course by slug:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

exports.createCourseWithSections = async (req, res) => {
  const {
    title,
    description,
    price,
    duration,
    category_id,
    instructor_id,
    status,
    thumbnail, 
    detailed_description,
    course_content,
    course_features,
    pricing_info,
    requirements,
    sections,
    top,
  } = req.body;

  try {
    let courseThumbnail = thumbnail;
    // Nếu có file upload, chuyển đổi file path thành URL đầy đủ
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find((f) => f.fieldname === "courseImage");
      if (imageFile) {
        const filePath = imageFile.path.replace(/\\/g, "/");
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        courseThumbnail = `${baseUrl}/${filePath}`;
      }
    }

    const statusValue = status === "active" ? 1 : 0;

    const [courseResult] = await Course.create({
      title,
      description,
      instructor_id,
      price,
      duration,
      thumbnail: courseThumbnail,
      status: statusValue,
      category_id,
      detailed_description,
      course_content,
      course_features,
      pricing_info,
      requirements,
      top: top || 0,
    });

    const courseId = courseResult.insertId || courseResult.id;
    if (!courseId) {
      return res
        .status(500)
        .json({ message: "Failed to create course. `course_id` is null." });
    }

    // Kiểm tra sections
    let parsedSections = [];
    if (sections) {
      if (typeof sections === "string") {
        parsedSections = JSON.parse(sections);
      } else {
        parsedSections = sections;
      }
    }

    // Lấy các file "documentFile" (nếu có)
    let documentFiles = [];
    if (req.files && req.files.length > 0) {
      documentFiles = req.files.filter((f) => f.fieldname === "documentFile");
    }

    // docIndex để gán tuần tự cho mỗi content "document"
    let docIndex = 0;

    // Tạo các section và nội dung (content)
    if (parsedSections && parsedSections.length > 0) {
      for (const [secIdx, section] of parsedSections.entries()) {


        const [sectionResult] = await CourseSections.create({
          course_id: courseId,
          title: section.title,
          description: section.description,
          video_url: section.video_url,
          is_free: section.is_free,
          order: section.order,
        });
        const sectionId = sectionResult.insertId;

        if (section.contents && section.contents.length > 0) {
          for (const [contentIdx, content] of section.contents.entries()) {

            let contentUrl = content.content_url || "";

            if (content.content_type === "document") {


              if (docIndex < documentFiles.length) {
                let docPath = documentFiles[docIndex].path.replace(/\\/g, "/");
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                contentUrl = `${baseUrl}/${docPath}`;
                docIndex++;
              } else {
                contentUrl = "";
              }
            }

            await CourseContent.create({
              course_id: courseId,
              section_id: sectionId,
              content_type: content.content_type,
              content_url: contentUrl,
              title: content.title,
              description: content.description,
              order_index: content.order_index,
            });
          }
        }
      }
    }

    return res
      .status(201)
      .json({ message: "Course with sections created successfully!" });
  } catch (error) {
    console.error("Error creating course with sections:", error);
    return res.status(500).json({
      message: "Error creating course with sections",
      error: error.message,
    });
  }
};


exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {

    const newCategory = await Course.createCate({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Error adding category" });
  }
};
exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  let courseData = req.body;
  try {
    if (typeof courseData.sections === "string") {
      courseData.sections = JSON.parse(courseData.sections);
    }
  } catch (error) {
    console.error("Error parsing sections JSON:", error);
    return res.status(400).json({ message: "Invalid sections data" });
  }



  try {
    if (!courseData) {

      return res.status(400).json({ message: "Missing course data for update" });
    }


    const courseUpdateResult = await Course.update(courseId, courseData);

    // Nếu có file đính kèm cho document, thu thập chúng từ req.files
    const documentFiles = req.files ? req.files.filter(file => file.fieldname === "documentFile") : [];
    let docIndex = 0;

    if (courseData.sections && Array.isArray(courseData.sections)) {

      for (const [i, section] of courseData.sections.entries()) {

        // Nếu mục bị đánh dấu is_deleted, xóa vĩnh viễn
        if (section.is_deleted) {
          if (section.id) {
            const deleteSectionResult = await CourseSections.deleteById(section.id);
          }
          continue;
        }
        let sectionId = section.id;

        if (sectionId) {
          const updateResult = await CourseSections.update(sectionId, section);
        } else {
          const [createResult] = await CourseSections.create({
            ...section,
            course_id: courseId,
          });

          sectionId = createResult.insertId;
        }

        // Xử lý các nội dung (contents) của section
        if (section.contents && Array.isArray(section.contents)) {

          for (const [j, content] of section.contents.entries()) {


            // Nếu nội dung là document và có file được upload trong req.files, lấy file theo thứ tự
            if (content.content_type === "document") {
              if (docIndex < documentFiles.length) {
                // Ở đây ta lấy đường dẫn file đã lưu (ví dụ: file.path)
                content.content_url = documentFiles[docIndex].path;

                docIndex++;
              } else {
                console.log(`No document file found for content index ${j}`);
              }
            }

            if (content.is_deleted) {

              if (content.id) {
                const deleteContentResult = await CourseContent.deleteById(content.id);

              }
              continue;
            }
            if (content.id) {

              const contentUpdateResult = await CourseContent.update(content.id, content);

            } else {

              const createContentResult = await CourseContent.create({
                ...content,
                course_id: courseId,
                section_id: sectionId,
              });

            }
          }
        } else {
          console.log(`No contents found for section index ${i}`);
        }
      }
    } else {
      console.log("No sections found in the payload.");
    }


    return res.status(200).json({
      message: "Course, sections, and contents updated successfully",
      courseUpdateResult,
      updatedData: courseData,
    });
  } catch (error) {
    console.error("Error updating the course:", error);
    return res.status(500).json({ message: "Error updating the course", error: error.message });
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
