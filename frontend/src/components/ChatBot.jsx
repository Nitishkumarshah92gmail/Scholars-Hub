import { useState, useRef, useEffect } from 'react';
import { HiX, HiPaperAirplane } from 'react-icons/hi';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your Scholars Hub AI assistant. Ask me anything about studying, academics, or how to use the platform!' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for OpenRouter
      const apiMessages = [
        {
          role: 'system',
          content: 'You are a helpful study assistant for a platform called Scholars Hub. Help students with academic questions, study tips, and platform usage. Keep responses concise and friendly.',
        },
      ];

      // Add previous messages (skip the initial greeting)
      for (let i = 1; i < messages.length; i++) {
        apiMessages.push({
          role: messages[i].role === 'user' ? 'user' : 'assistant',
          content: messages[i].text,
        });
      }

      // Add current user message
      apiMessages.push({ role: 'user', content: trimmed });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Scholars Hub',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: apiMessages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'No response received.';

      setMessages((prev) => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error('ChatBot API error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-ig-primary hover:bg-ig-primary-hover text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          title="Chat with AI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[340px] sm:w-[380px] h-[500px] flex flex-col rounded-2xl shadow-2xl border border-ig-separator dark:border-ig-separator-dark overflow-hidden bg-ig-bg dark:bg-ig-bg-dark-2 animate-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ig-primary text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.43 1.43a1.5 1.5 0 001.06 2.57h3.243a1.5 1.5 0 001.414-1l.707-2.12M19 14.5l1.43 1.43a1.5 1.5 0 01-1.06 2.57h-3.243a1.5 1.5 0 01-1.414-1l-.707-2.12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Scholars Hub AI</p>
                <p className="text-[11px] opacity-80">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-ig-primary text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-ig-bg-elevated px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-ig-text-2 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-2 h-2 bg-ig-text-2 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-ig-text-2 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-ig-separator dark:border-ig-separator-dark bg-ig-bg dark:bg-ig-bg-dark-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 rounded-full border border-ig-separator dark:border-ig-separator-dark bg-ig-bg-2 dark:bg-ig-bg-dark text-sm text-ig-text dark:text-ig-text-light placeholder:text-ig-text-2 outline-none focus:ring-1 focus:ring-ig-primary focus:border-ig-primary transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full bg-ig-primary hover:bg-ig-primary-hover text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
              >
                <HiPaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
