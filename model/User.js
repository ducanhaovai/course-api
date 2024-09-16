const db = require("../config/dbConfig");

const User = {
  // Tạo người dùng mới
  create: async (userData) => {
    try {
      const [result] = await db.query(
        "INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userData.username,
          userData.email,
          userData.password,
          userData.first_name,
          userData.last_name,
          userData.role,
        ]
      );
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Unable to create user");
    }
  },

  // Tìm người dùng theo email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0]; // Trả về người dùng đầu tiên tìm thấy
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error("Unable to find user by email");
    }
  },

  // Cập nhật access_token cho người dùng
  updateAccessToken: async (id, token) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET access_token = ? WHERE id = ?",
        [token, id]
      );
      return result;
    } catch (error) {
      console.error("Error updating access token:", error);
      throw new Error("Unable to update access token");
    }
  },
  clearAccessToken: async (id) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET access_token = NULL WHERE id = ?",
        [id]
      );
      return result;
    } catch (error) {
      console.error("Error clearing access token:", error);
      throw new Error("Unable to clear access token");
    }
  },
  getAllUsers: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM users");
      return rows;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Unable to fetch users");
    }
  },
  update: async (data, options) => {
    const { role } = data;
    const { where } = options;
    const userId = where.id;

    try {
      const [result] = await db.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [role, userId]
      );
      return result;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Error updating user role");
    }
  },
};

module.exports = User;
