import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, 
  ChevronDown, ShieldCheck, AlertCircle 
} from "lucide-react";
import api from "../../services/api";

const STATIC_FALLBACK_TEXT = (
  "I am sorry, but I can only answer questions related to the HomeServe company policies, " +
  "services, warranties, and operating procedures covered in our official handbook. " +
  "For other queries or customized assistance, please reach out to HomeServe Support at " +
  "support@homeserve.com or call our helpline."
);

const SUGGESTED_QUESTIONS = [
  "What is the warranty period for plumbing and electrical work?",
  "What are your official working hours and days?",
  "What is the cancellation and refund policy?",
  "What is the technician code of conduct?"
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: (
        "👋 **Hello!** I am your **HomeServe AI Policy Assistant**.\n\n" +
        "I can answer any questions about our **company policies, service warranties, pricing terms, cancellation rules, and technician safety** directly from our official handbook (`ragbased.pdf`)."
      ),
      isFallback: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history (excluding initial greeting)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: typeof m.content === "string" ? m.content : ""
        }));

      const res = await api.post("/chat", {
        message: query,
        history
      });

      const replyData = res.data || res;
      const botReply = replyData.reply || STATIC_FALLBACK_TEXT;
      const isFallback = replyData.is_fallback || false;

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: botReply,
        isFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: STATIC_FALLBACK_TEXT,
          isFallback: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: (
          "👋 Conversation reset! How can I help you today with HomeServe company policies or service guidelines?"
        ),
        isFallback: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Helper to format simple markdown-like text (bold & bullet points)
  const formatContent = (text) => {
    if (typeof text !== "string") return text;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      let isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
      if (isBullet) {
        trimmed = trimmed.replace(/^[\*\-•]\s*/, "");
      }

      // Replace bold **text**
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc my-0.5">
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={idx} className={line === "" ? "h-2" : "my-0.5 leading-relaxed"}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Trigger Button when Closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Open HomeServe AI Policy Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-semibold text-xs tracking-wide">
            Handbook AI
          </span>
        </button>
      )}

      {/* Small & Sleek Chatbot Window when Open */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[510px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight leading-none">HomeServe AI</h3>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-blue-100 font-medium leading-tight mt-0.5">
                  Policy & Handbook Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 hover:bg-white/15 rounded-lg text-blue-100 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:bg-white/15 rounded-lg text-blue-100 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader info pill */}
          <div className="bg-blue-50/80 border-b border-blue-100/60 px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">All responses verified against official <code className="bg-blue-100/80 px-1 rounded text-blue-800">ragbased.pdf</code></span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/60 text-xs sm:text-[13px]">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] shadow-xs transition-all ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none font-normal"
                        : msg.isFallback
                        ? "bg-amber-50/90 text-amber-950 border border-amber-200/80 rounded-tl-none"
                        : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-none"
                    }`}
                  >
                    {msg.isFallback && (
                      <div className="flex items-center gap-1 text-amber-700 font-semibold text-[11px] mb-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Scope Notice</span>
                      </div>
                    )}
                    <div className="break-words space-y-1">
                      {formatContent(msg.content)}
                    </div>
                    <span
                      className={`block text-[9px] mt-1 text-right select-none ${
                        isUser ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Suggestions (Shown when conversation is short) */}
            {messages.length <= 2 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Popular Handbook Questions:
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left text-[11px] bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg px-2.5 py-1.5 transition-all duration-150 line-clamp-1 shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask about warranty, hours, cancellation..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl p-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;

