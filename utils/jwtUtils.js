const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, status: user.status },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
