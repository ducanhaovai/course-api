const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ cho các file khóa học
const courseStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/courses/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Cấu hình lưu trữ cho các file do người dùng gửi
const userStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/user-submissions/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Tạo middleware upload cho từng loại
const uploadCourses = multer({ storage: courseStorage });
const uploadUserSubmissions = multer({ storage: userStorage });

module.exports = { uploadCourses, uploadUserSubmissions };
