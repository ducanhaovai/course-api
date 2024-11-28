const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Setup MariaDB connection
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
const db = {
  query: (sql, params) => pool.query(sql, params),
};

// Test MariaDB connection
const testMariaDBConnection = async () => {
  try {
    const [results] = await db.query("SELECT 1 + 1 AS result");
    console.log("MariaDB connection test successful:", results);
  } catch (error) {
    console.error("Error connecting to MariaDB:", error.message);
    process.exit(1);
  }
};

// Setup MongoDB connection
const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully!");
    mongoose.connection.on("connected", () => {
      console.log("Mongoose is connected to MongoDB.");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose is disconnected from MongoDB.");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

// Invoke MariaDB connection test
testMariaDBConnection();

module.exports = {
  db,
  connectToMongoDB,
};
