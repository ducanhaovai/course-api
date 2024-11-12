const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const API_URL = "http://localhost:8088/janus";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });
exports.uploadVideo = upload.single("video");

if (!fs.existsSync(path.join(__dirname, "../uploads"))) {
  fs.mkdirSync(path.join(__dirname, "../uploads"));
}

const sendJanusRequest = async (url, body) => {
  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("Error in Janus request:", error.message);
    throw new Error(`Failed to communicate with Janus: ${error.message}`);
  }
};

const getSessionAndAttachPlugin = async () => {
  try {
    const sessionResponse = await sendJanusRequest(API_URL, {
      janus: "create",
      transaction: `create_session_${Date.now()}`,
    });
    const sessionId = sessionResponse.data.data.id;

    const attachResponse = await sendJanusRequest(`${API_URL}/${sessionId}`, {
      janus: "attach",
      plugin: "janus.plugin.streaming",
      transaction: `attach_plugin_${Date.now()}`,
    });
    const handleId = attachResponse.data.data.id;

    return { sessionId, handleId };
  } catch (error) {
    throw error;
  }
};

exports.uploadVideoHandler = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Uploaded file not found" });
    }

    const { sessionId, handleId } = await getSessionAndAttachPlugin();

    const createStreamResponse = await sendJanusRequest(
      `${API_URL}/${sessionId}/${handleId}`,
      {
        janus: "message",
        body: {
          request: "create",
          type: "rtp",
          description: `RTP Stream for ${req.file.filename}`,
          id: Math.floor(Math.random() * 1000),
          audio: true,
          video: true,
          audioport: 8000,
          audiopt: 111,
          audiortpmap: "opus/48000/2",
          videoport: 8002,
          videopt: 96,
          videortpmap: "H264/90000",
        },
        transaction: `create_stream_${Date.now()}`,
      }
    );

    if (createStreamResponse.data.janus !== "success") {
      throw new Error("Failed to create stream in Janus");
    }

    const streamId = createStreamResponse.data.plugindata.data.stream.id;
    if (!streamId) {
      throw new Error("Stream ID is missing");
    }

    res.status(200).json({
      message: "Video uploaded and stream created successfully",
      streamId,
      sessionId,
      handleId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload video" });
  }
};

const pollForStreamEvent = async (
  sessionId,
  handleId,
  transactionId,
  streamId,
  maxRetries = 20
) => {
  let retries = maxRetries;

  while (retries > 0) {
    try {
      const response = await sendJanusRequest(
        `${API_URL}/${sessionId}/${handleId}`,
        {
          janus: "message",
          body: { request: "info", id: Number(streamId) },
          transaction: `poll_event_${Date.now()}`,
        }
      );

      if (
        response.data.janus === "event" &&
        response.data.transaction === transactionId
      ) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (error) {}
    retries--;
  }

  return false;
};

const checkStreamExists = async (sessionId, handleId, streamId) => {
  const response = await sendJanusRequest(
    `${API_URL}/${sessionId}/${handleId}`,
    {
      janus: "message",
      body: { request: "list" },
      transaction: `check_stream_${Date.now()}`,
    }
  );

  const streams = response.data.plugindata.data.list || [];
  console.log("Available streams:", streams);
  const streamExists = streams.some((stream) => stream.id === Number(streamId));
  if (!streamExists) {
    throw new Error(`Stream ID ${streamId} not found`);
  }

  return true;
};

exports.startStream = async (req, res) => {
  const { streamId } = req.body;
  if (!streamId) {
    console.log("Error: Missing streamId parameter in request body");
    return res.status(400).json({ error: "Missing streamId parameter" });
  }

  try {
    console.log("Starting stream with streamId:", streamId);

    const { sessionId, handleId } = await getSessionAndAttachPlugin();
    console.log("Session ID:", sessionId, "Handle ID:", handleId);

    console.log("Checking if stream exists...");
    await checkStreamExists(sessionId, handleId, streamId);
    console.log("Stream exists, proceeding to start stream...");

    const requestData = {
      janus: "message",
      body: { request: "watch", id: Number(streamId) },
      transaction: `start_stream_${Date.now()}`,
    };
    console.log(
      "Sending request to Janus:\nURL:",
      `${API_URL}/${sessionId}/${handleId}`
    );
    console.log("Request Data:", JSON.stringify(requestData, null, 2));

    const response = await sendJanusRequest(
      `${API_URL}/${sessionId}/${handleId}`,
      requestData
    );

    console.log("Response from Janus:", JSON.stringify(response.data, null, 2));

    // Step 5: Handle Janus response
    if (response.data.janus === "ack") {
      console.log("Received 'ack' from Janus, polling for stream event...");
      const success = await pollForStreamEvent(
        sessionId,
        handleId,
        response.data.transaction,
        streamId
      );

      if (success) {
        console.log("Stream started successfully");
        return res.status(200).json({
          message: "Stream started successfully",
          sessionId,
          handleId,
        });
      } else {
        console.error("Error: Timed out waiting for stream event");
        throw new Error("Timed out waiting for stream event");
      }
    } else if (response.data.janus === "success") {
      console.log("Stream started successfully with Janus 'success' response");
      return res
        .status(200)
        .json({ message: "Stream started successfully", sessionId, handleId });
    } else {
      console.error("Error: Unexpected response from Janus", response.data);
      throw new Error("Failed to start stream");
    }
  } catch (error) {
    console.error("Error starting stream:", error.message);
    res
      .status(500)
      .json({ error: "Failed to start stream", details: error.message });
  }
};

// Hàm tạo session Janus
exports.createSession = async (req, res) => {
  try {
    const response = await sendJanusRequest(API_URL, {
      janus: "create",
      transaction: `create_session_${Date.now()}`,
    });

    const sessionId = response.data.data.id;
    res.status(200).json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create session" });
  }
};

// Hàm gắn plugin Janus
exports.attachPlugin = async (req, res) => {
  const { sessionId } = req.body;
  try {
    const response = await sendJanusRequest(`${API_URL}/${sessionId}`, {
      janus: "attach",
      plugin: "janus.plugin.streaming",
      transaction: `attach_plugin_${Date.now()}`,
    });

    const handleId = response.data.data.id;
    res.status(200).json({ handleId });
  } catch (error) {
    res.status(500).json({ error: "Failed to attach plugin" });
  }
};

// Hàm liệt kê các stream
exports.listStreams = async (req, res) => {
  const { sessionId, handleId } = req.params;
  try {
    const response = await sendJanusRequest(
      `${API_URL}/${sessionId}/${handleId}`,
      {
        janus: "message",
        body: { request: "list" },
        transaction: `list_${Date.now()}`,
      }
    );

    if (response.data.janus === "success") {
      res.json(response.data.plugindata.data);
    } else {
      res.status(500).json({ error: "Failed to list streams" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to list streams" });
  }
};

// Hàm lấy danh sách video
exports.getVideo = async (req, res) => {
  const videoDir = path.join(__dirname, "../uploads");
  fs.readdir(videoDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load videos" });
    }

    const videos = files.map((file) => ({
      name: file,
      path: `/uploads/${file}`,
    }));
    res.status(200).json(videos);
  });
};

exports.sendSDP = async (req, res) => {
  const { sessionId, handleId } = req.params;
  const { sdp } = req.body;

  try {
    console.log("Sending SDP offer to Janus...");

    const response = await sendJanusRequest(
      `${API_URL}/${sessionId}/${handleId}`,
      {
        janus: "message",
        body: {
          request: "watch",
          sdp,
        },
        transaction: `sdp_offer_${Date.now()}`,
      }
    );

    if (response.data.janus === "success" && response.data.jsep) {
      console.log("Received SDP answer from Janus:", response.data.jsep);
      res.status(200).json(response.data.jsep); // Send the SDP answer back to the client
    } else {
      console.error("Failed to receive SDP answer from Janus");
      res
        .status(500)
        .json({ error: "Failed to receive SDP answer from Janus" });
    }
  } catch (error) {
    console.error("Error sending SDP to Janus:", error.message);
    res
      .status(500)
      .json({ error: "Error sending SDP to Janus", details: error.message });
  }
};
exports.trickle = async (req, res) => {
  const { sessionId, handleId } = req.params;
  const { candidate } = req.body;

  try {
    console.log("Sending ICE candidate to Janus:", candidate);

    await sendJanusRequest(`${API_URL}/${sessionId}/${handleId}`, {
      janus: "trickle",
      candidate,
      transaction: `trickle_${Date.now()}`,
    });

    res.status(200).json({ message: "ICE candidate sent successfully" });
  } catch (error) {
    console.error("Error sending ICE candidate to Janus:", error.message);
    res
      .status(500)
      .json({
        error: "Error sending ICE candidate to Janus",
        details: error.message,
      });
  }
};
