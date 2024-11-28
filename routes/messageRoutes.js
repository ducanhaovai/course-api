const {
  postMessage,
  getMessage,
  postRoom,
  getRoomUserMessage,
  getRoomMessage,
  postRoomUser,
} = require("../controllers/messageRoutes");
const express = require("express");
const router = express.Router();

router.post("/create-room", postRoom);
router.get("/rooms/:userId", getRoomUserMessage);
router.get("/messages/:roomId", getRoomMessage);
router.post("/send-message", postMessage);
router.post("/create-private-room", postRoomUser);

module.exports = router;
