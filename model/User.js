const db = require("../config/dbConfig");

const User = {
  create: (userData) => {
    return db.query(
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
  },

  findByEmail: (email) => {
    return db.query("SELECT * FROM users WHERE email = ?", [email]);
  },

  findByUsername: (username) => {
    return db.query("SELECT * FROM users WHERE username = ?", [username]);
  },
};

module.exports = User;
