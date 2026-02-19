'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronRight, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  options?: string[];
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hi there! 👋 How can we help you today?',
      options: ['Where is my order?', 'Item missing from order', 'Refund status', 'Other issue']
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate Bot Response
    setTimeout(() => {
      let botText = "I'm connecting you to a support agent. Please wait...";
      let options: string[] | undefined;

      if (text.includes('Where is my order')) {
        botText = "You can track your live order status on the Order Success page. Our delivery partner is on the way! 🛵";
      } else if (text.includes('Item missing')) {
        botText = "I'm sorry to hear that! Please select the items missing from your last order below.";
        options = ['Milk', 'Bread', 'Eggs']; // Mock items
      } else if (text.includes('Refund')) {
        botText = "Refunds are usually processed within 24-48 hours to your original payment source.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botText,
        options
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center gap-2 font-bold"
        >
          <MessageSquare size={24} />
          <span className="hidden md:inline">Help</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 border border-gray-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold">Customer Support</h3>
                <p className="text-xs text-white/80">Typically replies in 2 mins</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
                
                {/* Options Chips */}
                {msg.options && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.options.map(option => (
                      <button 
                        key={option}
                        onClick={() => handleSend(option)}
                        className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && input && handleSend(input)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={() => input && handleSend(input)}
              disabled={!input}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
