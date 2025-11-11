import './css/style.css';
import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [text, setText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatEndRef = useRef(null);
  

  const loadingMsgs = [
    "Purr-paring your content...",
    "Meow-ving things along...",
    "Purr-ocessing...",
    "Paws-ing for effect..."
  ];

  const errorMsgs = [
    "Meow-ch! Something went wrong. Try again soon!",
    "This is un-fur-tunate. The server may be down.",
    "Unable to fetch response right meow. Please try later."
  ];

  const getRandomLoadingMessage = () => {
    return loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
  };

  const getRandomErrorMessage = () => {
    return errorMsgs[Math.floor(Math.random() * errorMsgs.length)];
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

    try{
    const response = await fetch("http://127.0.0.1:5000/get_gif",{
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ text: userMessage }),
    });

    if (!response.ok){
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();

    if (!data.gif){
      throw new Error("No GIF in response.");
    }
    
    setChatHistory(prev => [...prev, {
      type: 'bot',
      gifURL: data.gif,
      description: data.metadata?.content_description || "cat gif"
    }]);

    } catch (err){
      console.error("Error fetching gif:", err);
  
      setChatHistory(prev => [...prev, {
        type: 'error',
        content: getRandomErrorMessage()
      }]);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
  if (chatEndRef.current) {
    chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
  }, [chatHistory, loading]);

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
            } else if (message.type === 'bot') {
              return (
                <div key={index} className="message-row bot-row">
                  <div className="gif-bubble">
                    <img
                      src={message.gifURL}
                      alt={message.description}
                      className='chat-gif'
                      onLoad={() => {
                        if (chatEndRef.current) {
                          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                  </div>
                </div>
              );
            } else if (message.type === 'error'){
              return (
                <div key={index} className='message-row bot-row'>
                  <div className="bot-message">
                    <p className="error-message">{message.content}</p>
                  </div>
                </div>
              ); 
            } else {
              console.error("Unknown message type:", message);
              return null;
            }
          })}

          {loading && (
            <div className="message-row bot-row">
              <div className="bot-message">
                <p className="loading-message">{getRandomLoadingMessage()}</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
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