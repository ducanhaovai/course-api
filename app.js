const express = require("express");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/courses", courseRoutes);
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
