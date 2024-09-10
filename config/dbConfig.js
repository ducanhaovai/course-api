const mysql = require("mysql2");

// Tạo một pool kết nối
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Leevan@2701",
  database: "online_courses",
  port: 3309, // Thêm port vào đây
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

module.exports = pool.promise();

pool
  .promise()
  .query("SELECT 1 + 1 AS result")
  .then(([results, fields]) => {
    console.log("Connection test successful:", results);
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
