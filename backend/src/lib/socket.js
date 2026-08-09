import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId
    if(userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle typing events
    socket.on("typingStart", async ({ receiverId }) => {
        if (!receiverId) return;
        const group = await Group.findById(receiverId);
        if (group) {
            // Broadcast to all group members except sender
            group.members.forEach((memberId) => {
                if (memberId.toString() !== userId) {
                    const memberSocketId = getReceiverSocketId(memberId.toString());
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("userTyping", { senderId: userId, groupId: group._id });
                    }
                }
            });
        } else {
            // 1-on-1
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { senderId: userId });
            }
        }
    });

    socket.on("typingStop", async ({ receiverId }) => {
        if (!receiverId) return;
        const group = await Group.findById(receiverId);
        if (group) {
            group.members.forEach((memberId) => {
                if (memberId.toString() !== userId) {
                    const memberSocketId = getReceiverSocketId(memberId.toString());
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("userStoppedTyping", { senderId: userId, groupId: group._id });
                    }
                }
            });
        } else {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
});

export { io, app, server };