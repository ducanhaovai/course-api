const Message = require("../model/Message");

module.exports = (io) => {
  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.add(userId);
      io.emit("onlineUsers", Array.from(onlineUsers));
    }

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
        io.to(roomId).emit("newMessage", savedMessage);
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers));
      }
    });
  });
};
