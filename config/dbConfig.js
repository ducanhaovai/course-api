const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3309,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
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
