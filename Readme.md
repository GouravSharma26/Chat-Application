# Fullstack Chat Application 🚀

## Overview
This is an advanced fullstack real-time chat application designed for instant, rich communication. It includes user authentication, real-time messaging, multiplayer group chats, voice notes, media sharing, and extensive theme customization. The application is built using modern web technologies to provide a blazing fast and visually stunning user experience.

## ✨ Features
- **Real-Time 1-on-1 & Group Chats :** Instant messaging with Socket.io, supporting unlimited participants in custom groups.
- **Voice Notes 🎙️:** Native in-browser audio recording to send voice messages on the fly.
- **Rich Media & Document Uploads :** Share images, videos, PDFs, and documents seamlessly (powered by Cloudinary).
- **Message Editing & Deletion :** Full control over your sent messages.
- **Typing Indicators & Unread Badges :** See when your friends are typing and never miss an unread message.
- **Theme Customization 🎨 :** Users can switch between dozens of premium DaisyUI themes for a personalized experience.
- **Profile Management :** Users can upload custom profile pictures or choose from beautiful built-in avatars.
- **Optimized Performance :** Indexed MongoDB queries, memoized React components, and optimized asset delivery.

## 🛠️ Tech Stack

### **Frontend**
- **React.js & Vite -** Lightning-fast UI rendering and bundling.
- **Tailwind CSS & DaisyUI -** For responsive, modern, and highly customizable styling.
- **Zustand -** Lightweight global state management.

### **Backend**
- **Node.js & Express.js -** Fast and scalable backend framework.
- **MongoDB & Mongoose -** NoSQL database with optimized indexing for real-time querying.
- **Cloudinary -** Cloud storage for images, videos, audio, and raw documents.

### **Real-Time Communication**
- **Socket.io -** Enables real-time bi-directional event emission (messages, typing statuses, online states).

## 🚀 Installation & Setup

### Prerequisites
Make sure you have the following installed:
- Node.js (Latest version)
- MongoDB (Local or cloud instance)
- Cloudinary Account (for media uploads)

### Backend setup
1. Clone the repository:
```bash
git clone https://github.com/GouravSharma26/Chat-Application.git
cd Chat-Application/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd ../frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the frontend development server:
```bash
npm run dev
```

## 🎮 Usage
- Sign up or log in to your account.
- Update your profile image or select a built-in avatar.
- Select a user to start a 1-on-1 chat, or click `+ New Group` to invite friends to a group room.
- Hold the `Mic` icon to record voice notes, or use the `Attachment` icon to send videos and documents.
- Change themes from the settings panel to match your aesthetic.

## 🤝 Contributions
Contributions are welcome! Feel free to fork this repository and submit a pull request.

## 📜 License
This project is licensed under the MIT License.
