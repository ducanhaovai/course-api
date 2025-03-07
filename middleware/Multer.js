const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

// Cấu hình lưu trữ cho file khóa học
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let slug = 'course';
    if (req.body && req.body.title) {
      slug = slugify(req.body.title, { lower: true, strict: true });
    }
    const baseDir = 'uploads/courses/';
    // Tạo folder cho khóa học: uploads/courses/{slug}
    const courseDir = path.join(baseDir, slug);
    let uploadDir;
    if (file.fieldname === 'courseImage') {
      uploadDir = path.join(courseDir, 'img');
    } else if (file.fieldname === 'documentFile') {
      uploadDir = path.join(courseDir, 'document');
    } else {
      uploadDir = courseDir;
    }
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    // Nếu field là documentFile mà không có extension thì mặc định thêm .pdf
    if (file.fieldname === 'documentFile' && !ext) {
      ext = '.pdf';
    }
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// Cấu hình lưu trữ cho file do người dùng gửi
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/user-submissions/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadCourses = multer({ storage: courseStorage });
const uploadUserSubmissions = multer({ storage: userStorage });

exports.uploadCourse = (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  const filePath = req.file.path.replace(/\\/g, "/");
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/${filePath}`;
  res.json({ imageUrl });
};

exports.uploadUserSubmission = (req, res) => {
  uploadUserSubmissions.single('userFile')(req, res, (err) => {
    if (err) return res.status(400).send('Error uploading file.');
    if (!req.file) {
      return res.status(400).send('No user file uploaded');
    }
    res.send('User file uploaded successfully');
  });
};

module.exports = { uploadCourses, uploadUserSubmissions };
