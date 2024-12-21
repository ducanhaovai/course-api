const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

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
const Message = require("./model/Message");
const topCourse = require("./routes/topCourseRoutes");
const notificationsRuotes = require("./routes/notificationRoutes");
const path = require("path");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
global.io = io;
// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
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

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
  });

  const userId = socket.handshake.query.userId;
  const userRole = socket.handshake.query.userRole;

  if (userRole === 1) {
    socket.join(`admin-${userId}`);
  }
  socket.on("sendMessage", async ({ senderId, roomId, message }) => {
    const newMessage = new Message({
      senderId,
      roomId,
      message,
      createdAt: new Date(),
    });

    try {
      const savedMessage = await newMessage.save();
      io.to(roomId).emit("newMessage", savedMessage);
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  });
  socket.on("userConnected", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {});
});

// Routes
app.use("/categories", categoryRoutes);
app.use("/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sections", courseSectionRoutes);
app.use("/api/content", courseContentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/topcourse", topCourse);
app.use("/api/notifications", notificationsRuotes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
