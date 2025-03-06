const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const initializeWebSocket = require("./config/websocket");
const rateLimit = require("express-rate-limit");
// Load environment variables
dotenv.config();

// Import routes
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const courseSectionRoutes = require("./routes/courseSectionRoutes");
const courseContentRoutes = require("./routes/courseContentRoutes");
const videoRoutes = require("./routes/videoRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes= require("./routes/uploadRoutes")

const topCourse = require("./routes/topCourseRoutes");
const notificationsRuotes = require("./routes/notificationRoutes");
const path = require("path");
const { authenticateToken } = require("./middleware/authMiddleware");
const app = express();
const httpServer = createServer(app);
const allowedOrigins = ["http://localhost:3000", "https://levancourse.com"];

io = new Server(httpServer, {
  cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
  },  
  transports: ['websocket']
});
global.io = io;
// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
connectToMongoDB();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
initializeWebSocket(io);

app.use("/api/categories",authenticateToken ,categoryRoutes);
app.use("/api/courses",authenticateToken, courseRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/admin", authenticateToken,adminRoutes);
app.use("/api/enrollments", authenticateToken,enrollmentRoutes);
app.use("/api/payments", authenticateToken,paymentRoutes);
app.use("/api/sections", authenticateToken,courseSectionRoutes);
app.use("/api/content", authenticateToken,courseContentRoutes);
app.use("/api/video", authenticateToken,videoRoutes);
app.use("/api/messages", authenticateToken,messageRoutes);
app.use("/api/topcourse", authenticateToken,topCourse);
app.use("/api/notifications", authenticateToken,notificationsRuotes);
app.use("/api/upload", authenticateToken,uploadRoutes );

app.get("/", (req, res) => {
  res.send("API is running...");
});



const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
