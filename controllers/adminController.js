const User = require("../model/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await User.findAllByRole(2);
    res.json({ instructors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructors", error });
  }
};
exports.updateUser = async (req, res) => {
  const { role, username, email, status } = req.body;
  const userId = req.params.id;

  try {
    const result = await User.update(
      { role, username, email, status },
      { where: { id: userId } }
    );
    if (result.affectedRows > 0) {
      res.json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await User.delete(userId);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.findAll({
      where: { role: 2 },
      attributes: ["id", "username"],
    });
    res.status(200).json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ error: "Error fetching instructors" });
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
