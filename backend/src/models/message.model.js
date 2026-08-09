import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for group messages
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false, // Optional for 1-on-1 messages
    },
    text: {
      type: String,
    },
    image: {
      type: String, // Legacy image field
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ["image", "video", "document"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Update index to handle groupId queries efficiently
messageSchema.index({ senderId: 1, receiverId: 1, groupId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
