const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import CORS middleware
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Enable CORS for requests from your frontend's origin
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Middleware to handle JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Set up your routes
app.use("/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
