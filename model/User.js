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
      return rows[0];
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
    const { role, username, email } = data;
    const { where } = options;
    const userId = where.id;

    try {
      const queryParts = [];
      const queryParams = [];

      if (role) {
        queryParts.push("role = ?");
        queryParams.push(role);
      }
      if (username) {
        queryParts.push("username = ?");
        queryParams.push(username);
      }
      if (email) {
        queryParts.push("email = ?");
        queryParams.push(email);
      }

      const query = `UPDATE users SET ${queryParts.join(", ")} WHERE id = ?`;
      queryParams.push(userId);

      const [result] = await db.query(query, queryParams);
      return result;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Error updating user role");
    }
  },
  updateLastLogin: async (id, lastLoginTime) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET last_login = ? WHERE id = ?",
        [lastLoginTime, id]
      );
      return result;
    } catch (error) {
      console.error("Error updating last login time:", error);
      throw new Error("Unable to update last login time");
    }
  },
  updateLastLogout: async (id, lastLogoutTime) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET last_logout = ? WHERE id = ?",
        [lastLogoutTime, id]
      );
      return result;
    } catch (error) {
      console.error("Error updating last logout time:", error);
      throw new Error("Unable to update last logout time");
    }
  },
  delete: async (id) => {
    try {
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Unable to delete user");
    }
  },
};

module.exports = User;
