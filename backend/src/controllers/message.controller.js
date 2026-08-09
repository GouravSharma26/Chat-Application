import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req._id;
        const filteredUserId = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUserId);
    } catch (error) {
        console.error("Error in getUsersForSidebbar", error.message);
        res.status(500).json({error: "Internal server error"})
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const group = await Group.findById(userToChatId);
        
        let messages;
        if (group) {
            // Group chat history
            messages = await Message.find({ groupId: group._id })
                .populate("senderId", "fullName profilePic")
                .sort({ createdAt: 1 });
        } else {
            // 1-on-1 chat history
            messages = await Message.find({
                $or: [
                    { senderId: myId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: myId },
                ],
            }).sort({ createdAt: 1 });
        }

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({error : "Internal Server Error"});
    }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileType } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let fileUrl;

    // Legacy image upload
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_app_messages",
        format: "webp",
        quality: "auto",
        transformation: [{ width: 800, crop: "limit" }]
      });
      imageUrl = uploadResponse.secure_url;
    }

    // New generic file upload (video, document, image)
    if (file) {
      let uploadOptions = {
        folder: "chat_app_messages",
        resource_type: "auto", // Automatically detect video vs raw document
      };

      if (fileType === "image") {
        uploadOptions.format = "webp";
        uploadOptions.quality = "auto";
        uploadOptions.transformation = [{ width: 800, crop: "limit" }];
      }

      const uploadResponse = await cloudinary.uploader.upload(file, uploadOptions);
      fileUrl = uploadResponse.secure_url;
    }

    const group = await Group.findById(receiverId);

    let newMessage;
    if (group) {
      newMessage = new Message({
        senderId,
        groupId: group._id,
        text,
        image: imageUrl,
        fileUrl: fileUrl,
        fileType: fileType,
      });
    } else {
      newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        fileUrl: fileUrl,
        fileType: fileType,
      });
    }

    await newMessage.save();

    if (group) {
      // Broadcast to all group members
      const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");
      group.members.forEach(memberId => {
        if (memberId.toString() !== senderId.toString()) {
          const memberSocketId = getReceiverSocketId(memberId.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("newMessage", populatedMessage);
          }
        }
      });
      res.status(201).json(populatedMessage);
    } else {
      // 1-on-1 direct message
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
      res.status(201).json(newMessage);
    }
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // Notify receiver if they are online
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully", id: messageId });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to edit this message" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    // Notify receiver if they are online
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
