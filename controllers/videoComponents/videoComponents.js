const axios = require("axios");

const API_URL = "http://localhost:8088/janus";

const getSessionAndAttachPlugin = async () => {
  try {
    // Step 1: Create a new session
    const sessionResponse = await axios.post(API_URL, {
      janus: "create",
      transaction: `create_session_${Date.now()}`,
    });

    if (!sessionResponse.data || sessionResponse.data.janus !== "success") {
      throw new Error("Failed to create session in Janus");
    }

    const sessionId = sessionResponse.data.data.id;
    console.log("Session created successfully:", sessionId);

    // Step 2: Attach plugin
    const attachResponse = await axios.post(`${API_URL}/${sessionId}`, {
      janus: "attach",
      plugin: "janus.plugin.streaming",
      transaction: `attach_plugin_${Date.now()}`,
    });

    if (!attachResponse.data || attachResponse.data.janus !== "success") {
      throw new Error("Failed to attach plugin in Janus");
    }

    const handleId = attachResponse.data.data.id;
    console.log("Plugin attached successfully with handleId:", handleId);

    return { sessionId, handleId };
  } catch (error) {
    console.error(
      "Error creating session and attaching plugin:",
      error.message
    );
    throw error;
  }
};


// Function to start watching a specific stream
const startWatchingStream = async (sessionId, handleId, streamId) => {
  try {
    console.log(`Attempting to watch stream with ID ${streamId}...`);
    const response = await axios.post(`${API_URL}/${sessionId}/${handleId}`, {
      janus: "message",
      body: {
        request: "watch",
        id: streamId,
      },
      transaction: `start_stream_${Date.now()}`,
    });

    if (response.data.janus === "ack") {
      console.log("Stream request acknowledged, waiting for result...");
      // Poll Janus for result
      return await pollForStreamResult(
        sessionId,
        handleId,
        response.data.transaction
      );
    } else if (response.data.janus === "success") {
      console.log("Stream started successfully.");
      return true;
    } else {
      const reason = response.data.error?.reason || "Unknown error";
      console.error(`Failed to start stream: ${reason}`);
      return false;
    }
  } catch (error) {
    console.error("Error starting stream:", error.message);
    throw error;
  }
};

// Polling function to wait for stream to start
const pollForStreamResult = async (
  sessionId,
  handleId,
  transaction,
  maxRetries = 20
) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await axios.post(`${API_URL}/${sessionId}/${handleId}`, {
        janus: "message",
        body: { request: "info" },
        transaction: `poll_result_${Date.now()}`,
      });

      console.log("Poll response:", response.data);

      if (
        response.data.janus === "event" &&
        response.data.transaction === transaction
      ) {
        if (response.data.plugindata && response.data.plugindata.data) {
          const { data } = response.data.plugindata;
          if (data.streaming === "event" && data.error_code) {
            console.error("Error received during polling:", data.error);
            return false;
          } else if (data.streaming === "event" && data.result) {
            console.log("Streaming successfully started.");
            return true;
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error during polling:", error.message);
    }
    retries++;
  }
  console.error("Polling for result timed out.");
  return false;
};
