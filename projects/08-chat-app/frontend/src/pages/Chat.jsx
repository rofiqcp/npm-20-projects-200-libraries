import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import RoomList from '../components/RoomList.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import MessageInput from '../components/MessageInput.jsx';
import OnlineStatus from '../components/OnlineStatus.jsx';

export default function Chat() {
  const { user, token, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io('/', { auth: { token } });
    socketRef.current = s;
    setSocket(s);

    s.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    s.on('user_typing', ({ username }) => {
      setTypingUsers((prev) => [...new Set([...prev, username])]);
    });
    s.on('user_stop_typing', ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });
    s.on('online_count', setOnlineCount);

    return () => s.disconnect();
  }, [token]);

  useEffect(() => {
    axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setRooms(r.data))
      .catch(console.error);
  }, [token]);

  const joinRoom = async (room) => {
    if (activeRoom) socketRef.current?.emit('leave_room', activeRoom.id);
    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);
    socketRef.current?.emit('join_room', room.id);
    try {
      const { data } = await axios.get(`/api/messages/${room.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const sendMessage = (content) => {
    if (!activeRoom || !content.trim()) return;
    socketRef.current?.emit('send_message', { roomId: activeRoom.id, content });
  };

  const createRoom = async (name) => {
    try {
      const { data } = await axios.post('/api/rooms', { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms((prev) => [data, ...prev]);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">💬 Chat</p>
              <p className="text-indigo-300 text-sm">@{user?.username}</p>
            </div>
            <button onClick={logout} className="text-indigo-300 hover:text-white text-sm">Logout</button>
          </div>
          <OnlineStatus count={onlineCount} />
        </div>
        <RoomList rooms={rooms} activeRoom={activeRoom} onJoin={joinRoom} onCreate={createRoom} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            <div className="bg-white border-b px-6 py-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 text-lg">#{activeRoom.name}</h2>
              {activeRoom.description && <p className="text-gray-500 text-sm">{activeRoom.description}</p>}
            </div>
            <ChatWindow messages={messages} currentUser={user} />
            <MessageInput
              onSend={sendMessage}
              onTyping={() => socketRef.current?.emit('typing', { roomId: activeRoom.id })}
              onStopTyping={() => socketRef.current?.emit('stop_typing', { roomId: activeRoom.id })}
              typingUsers={typingUsers}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl font-medium">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
