// components/messages.jsx
import React from "react";
import "./messages.css";

const BlockMessages = ({ cards }) => (
  <div className="messages-container">
    {cards.map(msg => (
      <div key={msg.id} className="message-bubble">
        <div className="message-text">{msg.text}</div>
        <div className="message-time">{msg.date}</div>
      </div>
    ))}
  </div>
);

export default BlockMessages;
