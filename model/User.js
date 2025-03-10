const { db } = require("../config/dbConfig");

const User = {
  create: async (userData) => {
    try {
      const [result] = await db.query(
        "INSERT INTO users (username, email, password, first_name, last_name, role, verified, verificationToken, otpExpiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userData.username,
          userData.email,
          userData.password,
          userData.first_name,
          userData.last_name,
          userData.role,
          userData.verified,
          userData.verificationToken,
          userData.otpExpiration 
        ]
      );
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Unable to create user");
    }
  },

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
  verifyUser: async (email) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET verified = 1, verificationToken = NULL, otpExpiration = NULL WHERE email = ?",
        [email]
      );
      return result;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw new Error("Unable to verify user");
    }
  },
  deleteByEmail: async (email) => {
    try {
      const [result] = await db.query("DELETE FROM users WHERE email = ? AND verified = 0", [email]);
      return result;
    } catch (error) {
      console.error("Error deleting user by email:", error);
      throw new Error("Unable to delete user");
    }
  },
  updateOTP: async (email, newOtp, newExpiration) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET verificationToken = ?, otpExpiration = ? WHERE email = ? AND verified = 0",
        [newOtp, newExpiration, email]
      );
      return result;
    } catch (error) {
      console.error("Error updating OTP:", error);
      throw new Error("Unable to update OTP");
    }
  },
  findById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw new Error("Unable to find user by id");
    }
  },
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
    const { role, username, email, status } = data;
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
      if (status) {
        queryParts.push("status = ?");
        queryParams.push(status);
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
  findAllByRole: async (role) => {
    const [results, fields] = await db.query(
      "SELECT id, username FROM users WHERE role = ?",
      [role]
    );
    return results; 
  },

  removeAccessToken: async (access_token) => {
    return db.query(
      "UPDATE users SET access_token = NULL WHERE access_token = ?",
      [access_token]
    );
  },
  updateAccessToken: async (id, access_token) => {
    return db.query("UPDATE users SET access_token = ? WHERE id = ?", [
      access_token,
      id,
    ]);
  },
  findByAccessToken: async (access_token) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE access_token = ?",
      [access_token]
    );
    return rows[0];
  },
};

module.exports = User;
