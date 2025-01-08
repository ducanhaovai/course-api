const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const {} = require("../utils/helpers");
const { generateAccessToken } = require("../utils/jwtUtils");
const Notification = require("../model/Notification");

exports.register = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {

      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: 3,
    });

    const admins = await User.findAllByRole(1);
    const notificationPromises = admins.map((admin) => {
      if (admin && admin.id) {
        return Notification.create({
          target_user_id: admin.id,
          message: `New user registered: ${email}`,
        });
      }
    });

    await Promise.all(notificationPromises);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    const accessToken = generateAccessToken(user);
    const lastLoginTime = new Date();
    await User.updateLastLogin(user.id, lastLoginTime);
    await User.updateAccessToken(user.id, accessToken);

    res.json({
      message: "Login successful",
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};
exports.logout = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const lastLogoutTime = new Date();
    await User.updateLastLogout(userId, lastLogoutTime);
    await User.removeAccessToken(accessToken);
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Error during logout", error: error.message });
  }
};
