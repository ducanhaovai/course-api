const User = require("../model/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  try {
    const result = await User.update({ role }, { where: { id: userId } });
    if (result.affectedRows > 0) {
      res.json({ message: "User role updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};


isAdmin = (req, res, next) => {
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
