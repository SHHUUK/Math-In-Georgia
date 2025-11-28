
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, Image as ImageIcon, X, Mic, Trash2, Download, Copy, Check } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage, ChatRole } from '../types';
import { MathRenderer } from './MathRenderer';

interface ChatInterfaceProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAddXp }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice & Image State
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
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

  // Handle Paste Event (Images)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setSelectedImage(reader.result as string);
              };
              reader.readAsDataURL(blob);
            }
            break;
          }
        }
      }
    };
    
    // Attach listener to the document so user can paste anywhere in the chat view
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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

  const handleClearHistory = () => {
    if (window.confirm('ნამდვილად გსურთ ისტორიის წაშლა?')) {
      setMessages([{ role: ChatRole.MODEL, text: 'ისტორია გასუფთავდა. რით შემიძლია დაგეხმაროთ?' }]);
      localStorage.removeItem('mathmaster_chat_history');
    }
  };

  const handleDownloadChat = () => {
    const textContent = messages.map(m => `${m.role === ChatRole.USER ? 'User' : 'AI'}: ${m.text}`).join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathmaster-chat-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Voice Input Logic
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false); // Stop logic handled by browser usually, but we can force state update
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("თქვენს ბრაუზერს არ აქვს ხმოვანი კარნახის მხარდაჭერა (სცადეთ Google Chrome).");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ka-GE'; // Georgian
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { 
      role: ChatRole.USER, 
      text: input + (selectedImage ? ' [სურათი თანდართულია]' : '') 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // GAMIFICATION: XP for asking
    if (onAddXp) onAddXp(10, 'დასვი კითხვა');
    
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
      <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Gemini Math Tutor</h3>
            <p className="text-xs text-slate-500">Powered by gemini-3-pro-preview</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={handleDownloadChat} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ჩატის გადმოწერა">
              <Download size={18} />
           </button>
           <button onClick={handleClearHistory} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ისტორიის გასუფთავება">
              <Trash2 size={18} />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start group'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-5 shadow-sm relative ${
                msg.role === ChatRole.USER 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className={`text-[15px] leading-relaxed font-medium`}>
                <MathRenderer text={msg.text} className={msg.role === ChatRole.USER ? 'text-white' : 'text-slate-800'} />
              </div>
              
              {/* Copy Button for AI messages */}
              {msg.role === ChatRole.MODEL && (
                <button 
                  onClick={() => handleCopyMessage(msg.text, idx)}
                  className="absolute bottom-2 right-2 p-1.5 text-slate-300 hover:text-indigo-600 bg-transparent hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="ტექსტის კოპირება"
                >
                   {copiedIndex === idx ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                </button>
              )}
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

          <div className="flex-1 relative">
             <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
               placeholder={selectedImage ? "დაამატე კომენტარი სურათზე..." : "დასვი კითხვა მათემატიკაზე... (Ctrl+V სურათისთვის)"}
               className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none max-h-32 min-h-[50px]"
               rows={1}
               style={{ height: 'auto' }}
             />
             {/* Voice Input Button */}
             <button 
                onClick={toggleVoiceInput}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="ხმოვანი კარნახი (ქართული)"
             >
                <Mic size={20} />
             </button>
          </div>
          
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
