const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ cho file khóa học
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/courses/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Cấu hình lưu trữ cho file do người dùng gửi
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/user-submissions/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const uploadCourses = multer({ storage: courseStorage });
const uploadUserSubmissions = multer({ storage: userStorage });


exports.uploadCourse = (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/courses/${req.file.filename}`;
  console.log({ imageUrl });
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
