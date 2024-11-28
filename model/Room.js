const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  isGroup: { type: Boolean, default: true }, 
  members: [{ type: String, required: true }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", roomSchema);
