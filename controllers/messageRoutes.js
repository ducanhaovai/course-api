const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const Room = require("../model/Room");

exports.postRoom = async (req, res) => {
  try {
    const { name, isGroup, members } = req.body;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const newRoom = await Room.create({ name, isGroup, members });
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error in creating room:", error.message);
    res.status(500).json({ error: "Failed to create room" });
  }
};

exports.getRoomUserMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await Room.find({ members: userId });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms for user ID:", userId, error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};
exports.getRoomMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { senderId, roomId, message } = req.body;
    if (!senderId || !roomId || !message) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const newMessage = await Message.create({ senderId, roomId, message });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.postRoomUser = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both users are required" });
    }

    const existingRoom = await Room.findOne({
      isGroup: false,
      members: { $all: [user1, user2] },
    });

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }
    const newRoom = await Room.create({
      name: `Private Chat: ${user1} & ${user2}`,
      isGroup: false,
      members: [user1, user2],
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating private room:", error.message);
    res.status(500).json({ error: "Failed to create private room" });
  }
};
