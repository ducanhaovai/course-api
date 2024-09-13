const jwt = require("jsonwebtoken");
//token generation and password hashing utilities
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = { generateToken };
