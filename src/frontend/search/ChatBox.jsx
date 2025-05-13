import { useState } from "react";

export default function ChatBox({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Request failed with status ${response.status}`
        );
      }
      const data = await response.json();
      
      if (!data?.success || !data.reply) {
        throw new Error(data?.error || "Server returned empty response");
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      
    } catch (err) {
      console.error("Chat error:", {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || "Failed to get response");
      setMessages(prev => prev.slice(0, -1));
      setInput(newMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-xl rounded-lg w-80 z-50 p-4 flex flex-col mb-16">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Ask AI</h2>
        <button onClick={onClose} className="focus:outline-none">❌</button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 max-h-60">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-2 rounded ${
              msg.role === "user" 
                ? "bg-blue-100 text-right ml-8" 
                : "bg-gray-100 mr-8"
            }`}
          >
            {msg.content}
          </div>
        ))}
        
        {isLoading && (
          <div className="text-sm p-2 rounded bg-gray-100 mr-8 animate-pulse">
            Thinking...
          </div>
        )}
        
        {error && (
          <div className="text-sm p-2 rounded bg-red-100 text-red-800">
            Error: {error}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Recommend me shows like..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-[#1963da] text-white text-sm px-4 py-2 rounded hover:bg-[#1452b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}