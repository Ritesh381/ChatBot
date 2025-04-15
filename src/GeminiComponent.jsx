import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GeminiComponent = ({ apiKey }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const chatContainerRef = useRef(null);

  // Initialize the API
  const genAI = new GoogleGenerativeAI(apiKey);
  const MODEL_NAME = "gemini-2.0-flash";

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to conversation immediately
      setConversation((prev) => [...prev, { role: "user", content: prompt }]);

      // Get the model and create a chat
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Send the prompt to Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        { role: "ai", content: textResponse },
      ]);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Error: ${err.message || "Failed to get response from Gemini"}`);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const handleClear = () => {
    setPrompt("");
    setError(null);
    setConversation([]);
  };

  return (
    <div className="gemini-container">
      <header className="gemini-header">
        <h1>Gemini Chat</h1>
      </header>

      <div className="chat-history" ref={chatContainerRef}>
        {conversation.length === 0 ? (
          <div className="empty-state">
            <p>Start your conversation with Gemini AI!</p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                <strong>{msg.role === "user" ? "You" : "Gemini"}</strong>
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Gemini something..."
          disabled={isLoading}
          rows="3"
        />

        <div className="button-group">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="send-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
          {conversation.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="clear-button"
            >
              Clear Chat
            </button>
          )}
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .gemini-container {
          width: 100%;
          padding: 20px;
          font-family: "Arial", sans-serif;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: auto;
          min-height: 400px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .gemini-header {
          text-align: left;
          padding-bottom: 10px;
          border-bottom: 1px solid #000000;
        }

        .gemini-header h1 {
          margin: 0;
          color: #000000;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.3px;
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
        }

        .empty-state {
          color: #666666;
          text-align: center;
          padding: 30px 10px;
          font-style: italic;
          font-size: 13px;
          background-color: #f8f8f8;
        }

        .message {
          display: flex;
          margin-bottom: 8px;
          width: 100%;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.ai {
          justify-content: flex-start;
        }

        .message-content {
          padding: 10px 12px;
          max-width: 70%;
        }

        .message.user .message-content {
          background-color: #000000;
          color: #ffffff;
        }

        .message.ai .message-content {
          background-color: #f0f0f0;
          color: #000000;
          border-left: 2px solid #000000;
        }

        .message-content strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          opacity: 0.7;
        }

        .message.user .message-content strong {
          color: #ffffff;
        }

        .message-content p {
          margin: 0;
          line-height: 1.4;
          white-space: pre-wrap;
          font-size: 14px;
        }

        .input-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #e0e0e0;
          padding-top: 12px;
        }

        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #000000;
          font-size: 14px;
          resize: none;
          transition: border-color 0.3s;
          background-color: #ffffff;
          min-height: 60px;
        }

        textarea:focus {
          outline: none;
          border-color: #666666;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        button {
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s;
        }

        button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .send-button {
          flex: 1;
          background-color: #000000;
          color: white;
        }

        .send-button:hover:not(:disabled) {
          background-color: #333333;
        }

        .clear-button {
          flex: 1;
          background-color: #ffffff;
          color: #000000;
          border: 1px solid #000000;
        }

        .clear-button:hover:not(:disabled) {
          background-color: #f5f5f5;
        }

        .error-message {
          color: #000000;
          padding: 10px;
          background-color: #f5f5f5;
          border-left: 3px solid #000000;
          font-size: 12px;
        }

        .spinner {
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 6px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GeminiComponent;
