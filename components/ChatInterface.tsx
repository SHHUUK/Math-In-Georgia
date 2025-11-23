import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage, ChatRole } from '../types';
import { MathRenderer } from './MathRenderer';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('mathmaster_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([{ role: ChatRole.MODEL, text: 'გამარჯობა! მე ვარ შენი მათემატიკის დამხმარე. მკითხე ნებისმიერი რამ ფორმულებზე ან ამოცანებზე.' }]);
      }
    } else {
      setMessages([{ role: ChatRole.MODEL, text: 'გამარჯობა! მე ვარ შენი მათემატიკის დამხმარე. მკითხე ნებისმიერი რამ ფორმულებზე ან ამოცანებზე.' }]);
    }
  }, []);

  // Save History to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mathmaster_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { 
      role: ChatRole.USER, 
      text: input + (selectedImage ? ' [სურათი თანდართულია]' : '') 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : undefined;
    const mimeType = selectedImage ? selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';')) : undefined;
    
    setSelectedImage(null);
    setIsTyping(true);

    const responseText = await chatWithGemini(messages, input, imageToSend, mimeType);
    
    const botMsg: ChatMessage = { role: ChatRole.MODEL, text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Gemini Math Tutor</h3>
          <p className="text-xs text-slate-500">Powered by gemini-3-pro-preview</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                msg.role === ChatRole.USER 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className={`text-[15px] leading-relaxed font-medium`}>
                <MathRenderer text={msg.text} className={msg.role === ChatRole.USER ? 'text-white' : 'text-slate-800'} />
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={16} />
              <span className="text-xs text-slate-400">ფიქრობს...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {selectedImage && (
          <div className="mb-3 relative inline-block animate-in slide-in-from-bottom-2">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm"
            />
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="სურათის ატვირთვა"
          >
            <Plus size={24} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "დაამატე კომენტარი სურათზე..." : "დასვი კითხვა მათემატიკაზე..."}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          
          <button 
            onClick={handleSend}
            disabled={isTyping || (!input.trim() && !selectedImage)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-all shadow-md hover:scale-105 active:scale-95 mb-1"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};