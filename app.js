const express = require("express");
const courseRoutes = require("./routes/courseRoutes");

const app = express();
app.use(express.json());
app.use("/courses", courseRoutes);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
