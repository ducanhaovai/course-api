const Notification = require("../model/Notification");

// Tạo thông báo mới
exports.createNotification = async (req, res) => {
  const { sender_id, target_user_id, message } = req.body;
  try {
    const newNotification = await Notification.create(
      sender_id,
      target_user_id,
      message
    );
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.findByUserId(userId);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Lấy tất cả thông báo
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all notifications",
      error: error.message,
    });
  }
};
