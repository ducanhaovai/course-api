const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  uploadVideoHandler,
  createSession,
  attachPlugin,
  startStream,
  getVideo,
  listStreams,
  sendSDP,
  trickle,
} = require("../controllers/videoController");


function validateStreamRequest(req, res, next) {
  const { sessionId, handleId } = req.params;
  const streamId = req.body.id || req.body.streamId || req.body?.body?.id;

  if (!sessionId || !handleId || !streamId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  req.body.streamId = streamId;
  next();
}

router.get("/list-video/:sessionId/:handleId", listStreams);
router.post("/upload-video", uploadVideo, uploadVideoHandler);
router.post("/create-session", createSession);
router.post("/attach-plugin", attachPlugin);
router.post("/trickle/:sessionId/:handleId", trickle);
router.post("/send-sdp/:sessionId/:handleId", sendSDP);
router.post(
  "/start-stream/:sessionId/:handleId",
  validateStreamRequest,
  startStream
);
router.get("/", getVideo);

module.exports = router;
