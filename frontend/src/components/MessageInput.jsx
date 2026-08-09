import React, { useRef, useState, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Image, Send, X, Paperclip, FileText, Video, Mic, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (socket && selectedUser) {
      socket.emit("typingStart", { receiverId: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typingStop", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFilePreview(reader.result);
          setFileType('audio');
          setFileName('Voice Note');
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let type = "document";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";

    // Cloudinary raw files max size might need to be considered, but Express limit is 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setFileType(type);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileType(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;
    
    // Capture the current values
    const messageData = {
      text: text.trim(),
      file: filePreview,
      fileType: fileType,
    };

    // Clear the input instantly for a better UX
    setText("");
    setFilePreview(null);
    setFileType(null);
    setFileName("");
    if(fileInputRef.current) fileInputRef.current.value = ""; 

    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {fileType === "image" && (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            )}
            {fileType === "video" && (
              <video
                src={filePreview}
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                controls={false}
              />
            )}
            {fileType === "document" && (
              <div className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border border-zinc-700 bg-base-300">
                <FileText className="size-8 text-primary" />
                <span className="text-[10px] text-zinc-400 mt-1 truncate w-16 text-center">{fileName}</span>
              </div>
            )}
            {fileType === "audio" && (
              <div className="w-32 h-12 flex flex-col items-center justify-center rounded-lg border border-zinc-700 bg-base-300">
                <Mic className="size-4 text-primary mb-1" />
                <span className="text-[10px] text-zinc-400 truncate text-center">Voice Note</span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
          />
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${filePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !filePreview}
        >
          <Send size={22} />
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`btn btn-sm btn-circle ${isRecording ? 'btn-error animate-pulse' : ''}`}
        >
          {isRecording ? <Square size={18} /> : <Mic size={20} />}
        </button>
      </form>
    </div>
  )
}

export default React.memo(MessageInput)
