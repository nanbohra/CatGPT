import './css/style.css';
import React, { useState } from 'react';

function App() {
  const [text, setText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const loadingMsgs = [
    "Purr-paring your content...",
    "Meow-ving things along...",
    "Purr-ocessing...",
    "Paws-ing for effect..."
  ]

  const getRandomLoadingMessage = () => {
    return loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim()) return;
    if (!chatStarted) setChatStarted(true);

    const userMessage = text;
    setText("");

    setChatHistory(prev => [...prev, {type: 'user', content: userMessage}]);

    console.log("Sending user message...");
    setLoading(true);


    const response = await fetch("http://127.0.0.1:5000/get_gif",{
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ text: userMessage }),
    });

    const data = await response.json();
    setChatHistory(prev => [...prev, {
      type: 'bot',
      gifURL: data.gif,
      description: data.metadata?.content_description || "cat gif"
    }]);

    setLoading(false);
    console.log(data);
  };

  return (
    <div className={`chat-container ${chatStarted ? "chat-started": ""}`}>
      {/* Header */}
      <header className='chat-header'>
        <h1>CatGPT</h1>
      </header>

      {/* Chat Body */}
      <main className='chat-body'>
        {!chatStarted && (
          <p className="landing-subtitle"> Tell meow how you're doing. </p>
        )}

        <div className="chat-messages">
          {chatHistory.map((message, index) => {          
            if (message.type === 'user') {
              return (
                <div key={index} className="message-row user-row">
                  <div className="user-message">
                    {message.content}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="message-row bot-row">
                  <div className="bot-message">
                    <img
                      src={message.gifURL}
                      alt={message.description}
                      className='chat-gif'
                    />
                  </div>
                </div>
              );
            }
          })}

          {loading && (
            <div className="message-row bot-row">
              <div className="bot-message">
                <p className="loading-message">{getRandomLoadingMessage()}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Text input form */}
      <div className='chat-footer'>
        <form onSubmit={handleSubmit}  className='chat-form'>
          <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's up?"
          className='chat-input'
        />
        <button className="chat-submit" type="submit">Send</button>
        </form>
      </div>
    </div>
    
  );
}
export default App;