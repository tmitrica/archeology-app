import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import "../styles/ArtifactChat.css";

const ArtifactChat = ({ artifactId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [artifactId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifactId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifactId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat for Artifact #{artifactId}</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      
      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.user_id === user?.id ? 'own' : ''}`}>
            <div className="message-header">
              <span className="username">{message.username}</span>
              <span className="time">{new Date(message.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!user}
        />
        <button type="submit" disabled={!user}>Send</button>
      </form>
    </div>
  );
};

export default ArtifactChat;