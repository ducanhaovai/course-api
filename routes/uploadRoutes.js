

const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const { uploadCourses, uploadUserSubmissions } = require("../middleware/Multer");


router.post('/course', uploadCourses.single('courseFile'), uploadController.uploadCourse);

// Route upload file người dùng gửi
router.post('/user-submission', uploadUserSubmissions.single('userFile'), uploadController.uploadUserSubmission);

module.exports = router;
