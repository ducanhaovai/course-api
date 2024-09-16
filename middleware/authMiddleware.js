const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
