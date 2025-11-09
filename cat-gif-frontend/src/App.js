import './style.css';
import React, { useState } from 'react';

function App() {
  const [text, setText] = useState("");

  const [gifData, setGifData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Sending user message...");

    if (!text.trim()) return;

    const response = await fetch("http://127.0.0.1:5000/get_gif",{
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setGifData(data)
    setText("");
    console.log(data);
  };

  return (
    <div className={`chat-container ${gifData ? "chat-started": ""}`}>
      <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1> CatGPT </h1>

      <div className='chat-content'>
        {gifData && (
          <div className="chat-area">
            <h2>Detected Emotion: {gifData.emotion}</h2>
            <img
              src={gifData.gif}
              alt={gifData.metadata?.content_description || "cat gif"}
              className='chat-gif'
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}  className='chat-form'>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you doing?"
          className='chat-input'
        />
        <button className="chat-submit" type="submit">Send</button>
      </form>
    </div>
    </div>
    
  );


}
export default App;