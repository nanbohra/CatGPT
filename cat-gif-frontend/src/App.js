import React, { useState } from 'react';

function App() {
  const [text, setText] = useState("");

  const [gifData, setGifData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Sending user message...");

    const response = await fetch("http://127.0.0.1:5000/get_gif",{
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setGifData(data)
    console.log(data);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1> CatGPT </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you doing?"
          style={{ padding: "0.5rem", fontSize: "1rem"}}
        />
        <button type="submit" style={{ marginLeft: "1rem"}}>
          Get GIF
        </button>
      </form>

      
      {gifData && (
      <div style={{ marginTop: "2rem" }}>
        <h2>Detected Emotion: {gifData.emotion}</h2>
        <img
          src={gifData.gif}
          alt={gifData.metadata?.content_description || "cat gif"}
          style={{ width: "300px", borderRadius: "12px" }}
        />
        <p>{gifData.metadata?.content_description}</p>
      </div>
    )}

    </div>
  );


}
export default App;