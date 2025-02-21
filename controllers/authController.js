const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const {} = require("../utils/helpers");
const { generateAccessToken } = require("../utils/jwtUtils");
const Notification = require("../model/Notification");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
exports.register = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({ message: "Email already in use" });
      } else {
        const now = new Date();
        if (existingUser.otpExpiration && now <= new Date(existingUser.otpExpiration)) {
          return res.status(400).json({
            message: "OTP has been sent to your email. Please check your email."
          });
        } else {
          await User.deleteByEmail(email);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: 3,
      verified: false,
      verificationToken: otpCode,
      otpExpiration: otpExpiration,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Mã OTP xác thực email",
      text: `Xin chào ${username},\n\nMã OTP của bạn là: ${otpCode}\n\nMã này có hiệu lực trong 10 phút. Vui lòng nhập mã này trong ứng dụng để xác thực email.\n\nCảm ơn!`,
      html: `<p>Xin chào ${username},</p>
             <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
             <p>Mã này có hiệu lực trong 10 phút. Vui lòng nhập mã này trong ứng dụng để xác thực email.</p>
             <p>Cảm ơn!</p>`,
    };

    await transporter.sendMail(mailOptions);


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

    res.status(201).json({
      message: "User registered successfully. Please check your email for the OTP code.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};
exports.verifyEmail = async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ message: "Thiếu email hoặc mã OTP" });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy người dùng" });
    }

    const now = new Date();
    if (!user.otpExpiration || now > new Date(user.otpExpiration)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." });
    }

    if (user.verificationToken !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ" });
    }

    await User.verifyUser(email);

    return res.status(200).json({ message: "Email đã được xác thực thành công!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Lỗi xác thực OTP", error: error.message });
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

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (!user.verified) {
      return res.status(401).json({
        message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn để xác thực tài khoản.",
      });
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
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
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
