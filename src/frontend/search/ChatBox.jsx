/**
 * @file ChatBox.jsx
 * @description A React component that provides a chat interface for interacting with an AI.
 * Users can send messages, and the component displays the conversation history,
 * loading indicators, and error messages. It communicates with a backend API endpoint ('/api/chat')
 * to get AI responses.
 */

// Import useState hook from React for managing component state.
import { useState } from "react";

/**
 * @function ChatBox
 * @description A React functional component that renders a floating chat box.
 * It allows users to type messages, send them to an AI backend, and displays the conversation.
 *
 * @param {object} props - The properties passed to the component.
 * @param {function} props.onClose - Callback function to be invoked when the chat box's close button is clicked.
 * @returns {JSX.Element} The rendered ChatBox component.
 */
export default function ChatBox({ onClose }) {
  /**
   * State variable to store the array of chat messages. Each message is an object
   * with `role` ('user' or 'assistant') and `content` (the message text).
   * @type {[Array<{role: string, content: string}>, function(Array<{role: string, content: string}>): void]}
   */
  const [messages, setMessages] = useState([]);
  /**
   * State variable for the current text entered by the user in the input field.
   * @type {[string, function(string): void]}
   */
  const [input, setInput] = useState("");
  /**
   * State variable to track if a response from the AI is currently being loaded.
   * Used to disable input/button and show a loading indicator.
   * @type {[boolean, function(boolean): void]}
   */
  const [isLoading, setIsLoading] = useState(false);
  /**
   * State variable to store any error messages that occur during chat interaction
   * (e.g., failed API request, server error).
   * @type {[string | null, function(string | null): void]}
   */
  const [error, setError] = useState(null);

  /**
   * Handles sending a user's message.
   * This asynchronous function performs several steps:
   * 1. Validates the input (not empty, not currently loading).
   * 2. Creates a new message object for the user's input.
   * 3. Optimistically updates the `messages` state to display the user's message immediately.
   * 4. Clears the input field and sets the loading state.
   * 5. Makes a POST request to the '/api/chat' backend endpoint with the current conversation history.
   * 6. Handles the API response:
   *    - If successful, adds the AI's reply to the `messages` state.
   *    - If an error occurs (network issue, server error, invalid response), it sets an error message,
   *      reverts the optimistic update (removes the user's last message), and restores the input field.
   * 7. Resets the loading state.
   * @async
   */
  const handleSend = async () => {
    // Prevent sending if input is empty/whitespace or if already loading a response.
    if (!input.trim() || isLoading) return;

    // Create a new message object for the user's current input.
    const newMessage = { role: "user", content: input };
    // Create an updated list of messages including the new user message for the API request and optimistic UI update.
    const updatedMessages = [...messages, newMessage];
    
    // Optimistically update the UI with the user's message.
    setMessages(updatedMessages);
    // Clear the input field.
    setInput("");
    // Set loading state to true and clear any previous errors.
    setIsLoading(true);
    setError(null);

    try {
      // Send the conversation history (including the new user message) to the backend chat API.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", // Specify JSON content type.
        },
        // The body includes all messages up to this point, providing context to the AI.
        body: JSON.stringify({ messages: updatedMessages }),
      });

      // Check if the HTTP response status indicates an error.
      if (!response.ok) {
        // Attempt to parse error data from the JSON response, or create a generic error object.
        const errorData = await response.json().catch(() => ({})); // Fallback if JSON parsing fails.
        // Throw an error with a message from the API or a generic status message.
        throw new Error(
          errorData.error || // Prefer `error` field from backend response.
          errorData.message || // Then `message` field from backend response.
          `Request failed with status ${response.status}` // Generic HTTP error if no specific message.
        );
      }
      // Parse the successful JSON response from the server.
      const data = await response.json();
      
      // Validate the structure of the successful response.
      // Expects `success: true` and a `reply` field.
      if (!data?.success || !data.reply) {
        throw new Error(data?.error || "Server returned empty response"); // Throw error if response is not as expected.
      }

      // Add the AI's reply to the messages state.
      setMessages(prev => [ // Use functional update for `setMessages`.
        ...prev, // Keep all previous messages.
        { role: "assistant", content: data.reply }, // Add the new assistant (AI) message.
      ]);
      
    } catch (err) {
      // Handle errors that occurred during the fetch request or response processing.
      // Log detailed error information to the console for debugging.
      console.error("Chat error:", {
        error: err,
        message: err.message,
        stack: err.stack // Log stack trace for better debugging.
      });
      // Set the error message to be displayed in the UI.
      setError(err.message || "Failed to get response");
      // Revert the optimistic UI update by removing the user's last message that caused the error.
      setMessages(prev => prev.slice(0, -1));
      // Restore the user's original input to the input field so they can edit or retry.
      setInput(newMessage.content);
    } finally {
      // Regardless of success or failure, set loading state to false after the operation is complete.
      setIsLoading(false);
    }
  };

  // Render the chat box UI.
  return (
    // Main container for the chat box, styled to be fixed at the bottom-right of the screen.
    // `mb-16` adds bottom margin, possibly to avoid overlap with a fixed bottom navbar.
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-xl rounded-lg w-80 z-50 p-4 flex flex-col mb-16">
      {/* Header section of the chat box: title and close button. */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Ask AI</h2>
        {/* Close button (uses a cross mark emoji). Calls `onClose` prop when clicked. */}
        <button onClick={onClose} className="focus:outline-none">❌</button>
      </div>
      
      {/* Message display area. It's scrollable and has a maximum height. */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 max-h-60"> {/* `max-h-60` limits height, `overflow-y-auto` enables scroll. */}
        {/* Map over the `messages` array to render each message. */}
        {messages.map((msg, i) => (
          <div
            key={i} // Using index as key; consider more stable keys if messages can be reordered/deleted.
            // Dynamic styling based on message role ('user' or 'assistant').
            className={`text-sm p-2 rounded ${
              msg.role === "user" 
                ? "bg-blue-100 text-right ml-8"  // User messages: blue background, right-aligned, indented from left.
                : "bg-gray-100 mr-8"             // Assistant messages: gray background, left-aligned, indented from right.
            }`}
          >
            {msg.content} {/* Display the actual message content. */}
          </div>
        ))}
        
        {/* Display a "Thinking..." message with a pulse animation while waiting for AI response. */}
        {isLoading && (
          <div className="text-sm p-2 rounded bg-gray-100 mr-8 animate-pulse"> {/* `animate-pulse` for loading indication. */}
            Thinking...
          </div>
        )}
        
        {/* Display an error message if an error occurred during chat interaction. */}
        {error && (
          <div className="text-sm p-2 rounded bg-red-100 text-red-800"> {/* Error messages styled in red. */}
            Error: {error}
          </div>
        )}
      </div>
      
      {/* Input area at the bottom of the chat box: text input field and send button. */}
      <div className="flex gap-2">
        {/* Text input field for typing messages. */}
        <input
          className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" // Styling for input field.
          placeholder="Recommend me shows like..." // Placeholder text.
          value={input} // Controlled component: value is bound to `input` state.
          onChange={(e) => setInput(e.target.value)} // Update `input` state on change.
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send message when Enter key is pressed.
          disabled={isLoading} // Disable input field while loading a response.
        />
        {/* Send button. */}
        <button
          onClick={handleSend} // Call `handleSend` function when button is clicked.
          disabled={isLoading} // Disable button while loading.
          // Styling for the send button, including dynamic styles for disabled state.
          className="bg-[#1963da] text-white text-sm px-4 py-2 rounded hover:bg-[#1452b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'} {/* Dynamically set button text based on loading state. */}
        </button>
      </div>
    </div>
  );
}