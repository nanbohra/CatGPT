import './css/style.css';
import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [text, setText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatEndRef = useRef(null);
  const [showAbout, setShowAbout] = useState(false);

  const loadingMsgs = [
    "Purr-paring your content...",
    "Meow-ving things along...",
    "Purr-ocessing...",
    "Paws-ing for effect..."
  ];

  const errorMsgs = [
    "Meow-ch! Something went wrong. Try again soon!",
    "This is un-fur-tunate. The server may be down.",
    "Unable to fetch a response right meow. Please try later."
  ];

  const getRandomLoadingMessage = () => {
    return loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
  };

  const getRandomErrorMessage = () => {
    return errorMsgs[Math.floor(Math.random() * errorMsgs.length)];
  };

  const copyToClipboard = async (url, buttonId) => {
    try {
      await navigator.clipboard.writeText(url);
      // Visual feedback -- handle this in the button click
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  /* Sharing functions */
  const shareToWhatsApp = (url) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this cat GIF! ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTwitter = (url) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this cat GIF!')}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = (url) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  /* End sharing functions */

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
    <>
    <div className={`chat-container ${chatStarted ? "chat-started": ""}`}>
      {/* Header */}
      <header className='chat-header'>
        <button className="about-btn" onClick={() => setShowAbout(true)}>
          About Meow
        </button>
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
                  <img src={require('./css/user_icon.png')} alt="user" className="message-icon" />
                </div>
              );
            } else if (message.type === 'bot') {
              return (
                <div key={index} className="message-row bot-row">
                  <img src={require('./css/catgpt_icon.png')} alt="catgpt" className="message-icon" />
                  <div className='bot-content'>
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
                    {/* Share buttons */}
                    <div className="share-buttons side-share">
                      <button 
                        className="share-icon-btn" 
                        onClick={() => copyToClipboard(message.gifURL)}
                        >
                          <img src={require('./css/icon-link.png')} alt="Copy URL" />
                        </button>

                          <button 
                            className="share-icon-btn" 
                            onClick={() => shareToWhatsApp(message.gifURL)}
                          >
                            <img src={require('./css/icon-whatsapp.png')} alt="WhatsApp" />
                          </button>

                          <button 
                            className="share-icon-btn" 
                            onClick={() => shareToTwitter(message.gifURL)}
                          >
                            <img src={require('./css/icon-x.png')} alt="X" />
                          </button>

                          <button 
                            className="share-icon-btn" 
                            onClick={() => shareToFacebook(message.gifURL)}
                          >
                            <img src={require('./css/icon-facebook.png')} alt="Facebook" />
                          </button>
                        </div>
                        
                  </div>
                </div>
              );
            } else if (message.type === 'error'){
              return (
                <div key={index} className='message-row bot-row'>
                  <img src={require('./css/catgpt_icon.png')} alt="catgpt" className="message-icon" />
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

    {/* About Modal */}
      {showAbout && (
        <>
          <div className="modal-overlay" onClick={() => setShowAbout(false)} />
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowAbout(false)}>
              ×
            </button>
            <h2>About CatGPT</h2>
            <div className="modal-body">
              <h3 style={{ fontSize: '1.75rem' }}>hello, i'm nandini!</h3>
              <p>
                this app is my way of combining today's advances in AI and generative tech with my love for cats as i further explore frontend design, backend optimizations, and ml integrations. life is just better when you bring cat GIFs into the picture. <br />
                <br />
                to be clear, i do not have a cat, but i do love them. hahaha.
              </p>
              
              
              <h3 style={{ textAlign: 'center' }}>Coming Soon!</h3>
              <p>
                <strong> Catty Text Responses: </strong> CatGPT will soon answer your questions with text responses, and you'll truly feel like you're talking to a cat. Or as close as we can get with AI.
              </p>
              
              <h3 style={{ textAlign: 'center' }}>Tech Stack & Behind-the-Scenes</h3>
              <ul>
                <li><strong>Frontend:</strong> JavaScript, React, CSS</li>
                <li><strong>Backend:</strong> Flask, Python</li>
                <li><strong>ML:</strong> Jochen Hartmann's <em>Emotion English DistilRoBERTa-base</em>, found <a href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base" target="_blank" rel="noopener noreferrer">here</a> .</li>
                <li><strong>APIs:</strong> Tenor API for GIFs</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default App;