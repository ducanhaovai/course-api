const Message = require("../model/Message");

module.exports = (io) => {
  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    // Kiểm tra trạng thái kết nối ngay khi có kết nối mới
    if (socket.connected) {
      console.log("Socket đang kết nối");
    } else {
      console.log("Socket chưa kết nối");
    }
    console.log(`Socket connected: ${socket.id}`);

    // Sự kiện khi socket kết nối hoàn toàn
    socket.on("connect", () => { 
    });

    // Sự kiện khi có lỗi kết nối
    socket.on("connect_error", (error) => {
      console.error(`Lỗi kết nối cho socket ${socket.id}:`, error);
    });

    // Lấy userId từ query string khi kết nối
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.add(userId);
      // Phát lại danh sách onlineUsers cho tất cả client
      io.emit("onlineUsers", Array.from(onlineUsers));
    } else {
      console.warn(`[Socket] Connection without userId: Socket ID ${socket.id}`);
    }

    // Sự kiện tham gia phòng
    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ senderId, roomId, message }) => {
      const newMessage = new Message({
        senderId,
        roomId,
        message,
        createdAt: new Date(),
      });

      try {
        const savedMessage = await newMessage.save();
        // Gửi tin nhắn tới các client trong phòng tương ứng
        io.to(roomId).emit("newMessage", savedMessage);
      } catch (error) {
        console.error("[Socket] Failed to save message:", error);
      }
    });

    // Sự kiện khi socket disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] Socket ${socket.id} disconnected.`);
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers));
      }
    });
  });

};
