import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import "../styles/ArtifactChat.css";

const ArtifactChat = ({ artifactId, onClose }) => {
  // Chat state management
  const [messages, setMessages] = useState([]); // Stores message history
  const [newMessage, setNewMessage] = useState(''); // Controls input field
  const { user } = useAuth(); // Authentication context for user status

  // Real-time message polling mechanism
  useEffect(() => {
    const fetchAndSchedule = async () => {
      await fetchMessages(); // Initial fetch
      const interval = setInterval(fetchMessages, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval); // Cleanup on unmount/artifactId change
    };
    fetchAndSchedule();
  }, [artifactId]); // Re-initializes when artifact changes

  // Message retrieval logic
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifactId}/messages`);
      const data = await response.json();
      setMessages(data); // Update message history
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Message submission handler
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // Prevent empty messages

    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifactId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT auth
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage(''); // Clear input field
        fetchMessages(); // Immediate refresh after sending
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
      
      {/* Messages display area with scroll */}
      <div className="messages-list">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.user_id === user?.id ? 'own' : ''}`} // Highlight user's messages
          >
            <div className="message-header">
              <span className="username">{message.username}</span> {/* Sender identity */}
              <span className="time">
                {new Date(message.created_at).toLocaleTimeString()} {/* Formatted timestamp */}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>

      {/* Message input with auth-based controls */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!user} // Disable for unauthorized users
        />
        <button type="submit" disabled={!user}>Send</button>
      </form>
    </div>
  );
};

export default ArtifactChat;