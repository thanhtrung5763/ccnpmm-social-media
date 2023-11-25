const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
    title: {
      type: String,
    },
    file_url: {
      type: String,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'clip', 'video_link'],
      default: 'text'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
