"use client";
import React, { useState, useRef, useTransition, useEffect } from "react";
import { IoSend, IoCreate, IoCheckmark, IoClose } from "react-icons/io5";
import FetchData from "./app/chat/FetchData";
import ReactMarkdown from "react-markdown";

function DataRequest() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const chatContainerRef = useRef(null);

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  function handleResponse() {
    if (!message.trim() || isPending) return;
    startTransition(async () => {
      const userMessage = { role: "user", text: message };
      setChatHistory((prev) => [...prev, userMessage]);

      try {
        const data = await FetchData({ chatHistory: [...chatHistory, userMessage] });
        const botMessage = { role: "bot", text: data || "No response received." };
        setChatHistory((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error processing response:", error);
      }
      setMessage("");
    });
  }

  async function saveEdit(index) {
    const updatedHistory = [...chatHistory];
    updatedHistory[index].text = editMessage;
    setChatHistory(updatedHistory);
    setEditingIndex(null);

    try {
      const data = await FetchData({ chatHistory: updatedHistory });
      updatedHistory[index + 1].text = data || "No response received.";
      setChatHistory([...updatedHistory]);
    } catch (error) {
      console.error("Error fetching updated response:", error);
    }
  }

  function startEditing(index) {
    setEditingIndex(index);
    setEditMessage(chatHistory[index].text);
  }

  function cancelEdit() {
    setEditingIndex(null);
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div 
      className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white"
      style={{
        backgroundImage: "url('/images.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-2xl p-4 border-2 border-white-500 shadow-lg rounded-lg flex flex-col min-h-screen relative">
        <div className="text-center text-black-400 text-3xl pb-3  border-b border-black">
          I am ChatGPT. How can I assist you? 
        </div>
        {/* Chat Messages with Scrollbar */}
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700"
          style={{ maxHeight: "90vh", marginBottom: "80px" }}
        >
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start bg-gray-700 rounded-lg border-2 border-white-500"}`}>
              <div className={`relative px-4 py-2 max-w-[90%] rounded-lg ${
                chat.role === "user" ? "bg-neutral-900 text-lg text-white rounded-br-none" : "bg-gray-700 text-gray-200 rounded-bl-none"
              }`}>
                {editingIndex === index ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="bg-gray-900 text-white p-1 rounded"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                    />
                    <IoCheckmark className="text-green-400 cursor-pointer" onClick={() => saveEdit(index)} />
                    <IoClose className="text-red-400 cursor-pointer" onClick={cancelEdit} />
                  </div>
                ) : (
                  <ReactMarkdown>{chat.text}</ReactMarkdown>
                )}

                {chat.role === "user" && editingIndex !== index && (
                  <IoCreate
                    className="absolute top-1 right-1 text-gray-300 cursor-pointer hover:text-gray-100"
                    onClick={() => startEditing(index)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Input Field */}
        <div className="absolute bottom-0 left-0 w-full bg-gray-900 p-3 border-t border-gray-700 flex items-center">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-grow p-2 bg-gray-800 text-white rounded-lg focus:outline-none"
            value={message}
            onChange={handleMessage}
            onKeyDown={(e) => e.key === "Enter" && handleResponse()}
            disabled={isPending}
          />
          <button onClick={handleResponse} disabled={isPending} className="ml-3 p-2 bg-blue-600 hover:bg-blue-700 rounded-full">
            {isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <IoSend className="text-white text-2xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataRequest;
