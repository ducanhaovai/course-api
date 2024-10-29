const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.user = user;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.role !== 1) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
