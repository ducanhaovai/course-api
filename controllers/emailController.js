exports.getAllCategories = async (req, res) => {
  let { to, subject, text } = req.body;

  let transporter = nodemailer.createTransport({
    host: "smtp.example.com", // Thay thế bằng SMTP host của bạn
    port: 587,
    secure: false,
    auth: {
      user: "your-email@example.com", // Thay thế bằng email của bạn
      pass: "your-password", // Thay thế bằng mật khẩu của bạn
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"My Email Server" <your-email@example.com>', // Thay thế email gửi
      to: to, // Danh sách người nhận
      subject: subject,
      text: text,
    });

    res.send("Email sent successfully: " + info.response);
  } catch (error) {
    console.error("Error sending email: " + error.message);
    res.send("Failed to send email: " + error.message);
  }
};
