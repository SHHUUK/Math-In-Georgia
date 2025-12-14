import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, Image as ImageIcon, X, Mic, Trash2, Download, Copy, Check, MessageSquare, Menu, Clock, Edit3 } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage, ChatRole, ChatSession } from '../types';
import { MathRenderer } from './MathRenderer';

interface ChatInterfaceProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

const DEFAULT_WELCOME_MSG: ChatMessage = { role: ChatRole.MODEL, text: 'გამარჯობა! მე ვარ შენი მათემატიკის დამხმარე. მკითხე ნებისმიერი რამ ფორმულებზე ან ამოცანებზე. ასევე, შეგიძლია ჩააგდო ფოტო და მე მას გავაანალიზებ.' };

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAddXp }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MSG]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Sidebar toggle
  
  // Voice & Image State
  const [isListening, setIsListening] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string, id: string}[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Session Management ---

  // Load Sessions from LocalStorage on Mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('mathmaster_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (e) {
        console.error("Error parsing chat sessions", e);
      }
    }
    // Initialize a new session ID if none exists
    if (!currentSessionId) {
       createNewSession(false); // Create ID but don't clear default welcome yet
    }
  }, []);

  // Save Sessions to LocalStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('mathmaster_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update current session in the sessions array whenever messages change
  useEffect(() => {
    if (!currentSessionId) return;
    
    // Don't save if it's just the welcome message
    if (messages.length === 1 && messages[0] === DEFAULT_WELCOME_MSG) return;

    setSessions(prev => {
      const existingIdx = prev.findIndex(s => s.id === currentSessionId);
      
      // Determine Title (First user message)
      const firstUserMsg = messages.find(m => m.role === ChatRole.USER);
      let title = firstUserMsg ? firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '') : 'ახალი ჩატი';
      if (firstUserMsg?.text.includes('[სურათი თანდართულია]')) title = "ფოტოს ანალიზი";

      const updatedSession: ChatSession = {
        id: currentSessionId,
        title: title,
        date: new Date().toLocaleDateString('ka-GE'),
        preview: messages[messages.length - 1].text.substring(0, 50),
        messages: messages
      };

      if (existingIdx >= 0) {
        const newSessions = [...prev];
        newSessions[existingIdx] = updatedSession;
        return newSessions; // Move to top? Or keep order? Keep order for now.
      } else {
        return [updatedSession, ...prev]; // Add new to top
      }
    });
  }, [messages, currentSessionId]);

  const createNewSession = (clearView = true) => {
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    if (clearView) {
      setMessages([DEFAULT_WELCOME_MSG]);
    }
    setIsHistoryOpen(false); // Close sidebar on mobile if open
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("ნამდვილად გსურთ ამ ჩატის წაშლა?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        createNewSession();
      }
    }
  };

  // --- Chat Logic ---

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImages]);

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        const promises: Promise<{data: string, mimeType: string, id: string}>[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i] as any; // Cast to any to avoid TS errors
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            if (blob) {
              const p = new Promise<{data: string, mimeType: string, id: string}>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve({
                    data: (reader.result as string).split(',')[1],
                    mimeType: blob.type,
                    id: Math.random().toString(36).substr(2, 9)
                  });
                };
                reader.readAsDataURL(blob);
              });
              promises.push(p);
            }
          }
        }
        
        if (promises.length > 0) {
           Promise.all(promises).then(newImages => {
              setSelectedImages(prev => [...prev, ...newImages]);
           });
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const promises: Promise<{data: string, mimeType: string, id: string}>[] = [];
      Array.from(files).forEach(file => {
         const p = new Promise<{data: string, mimeType: string, id: string}>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
               resolve({
                  data: (reader.result as string).split(',')[1],
                  mimeType: file.type,
                  id: Math.random().toString(36).substr(2, 9)
               });
            };
            reader.readAsDataURL(file);
         });
         promises.push(p);
      });

      Promise.all(promises).then(newImages => {
         setSelectedImages(prev => [...prev, ...newImages]);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
     setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const userMsg: ChatMessage = { 
      role: ChatRole.USER, 
      text: input + (selectedImages.length > 0 ? ` [${selectedImages.length} სურათი თანდართულია]` : '') 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    if (onAddXp) onAddXp(10, 'დასვი კითხვა');
    
    const imagesToSend = [...selectedImages]; // Copy current images to send
    setSelectedImages([]); // Clear preview immediately
    setIsTyping(true);

    // Filter to pass only data and mimeType to service
    const serviceImages = imagesToSend.map(img => ({ data: img.data, mimeType: img.mimeType }));

    const responseText = await chatWithGemini(messages, input, serviceImages);
    
    const botMsg: ChatMessage = { role: ChatRole.MODEL, text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Voice Input
  const toggleVoiceInput = () => {
    if (isListening) { setIsListening(false); return; }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("თქვენს ბრაუზერს არ აქვს ხმოვანი კარნახის მხარდაჭერა.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ka-GE';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex h-full bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* --- SIDEBAR: HISTORY (Desktop: Static, Mobile: Absolute Overlay) --- */}
      <div className={`
         absolute md:relative inset-y-0 left-0 z-20 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
         ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'} 
         ${isHistoryOpen ? 'shadow-2xl md:shadow-none' : ''}
      `}>
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Clock size={18}/> ისტორია</h3>
            <button onClick={() => setIsHistoryOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600"><X size={20}/></button>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.length === 0 ? (
               <div className="text-center text-slate-400 text-sm mt-10 p-4">ისტორია ცარიელია</div>
            ) : (
               sessions.map(session => (
                  <div 
                    key={session.id} 
                    onClick={() => loadSession(session)}
                    className={`p-3 rounded-xl cursor-pointer group transition-all border ${currentSessionId === session.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold truncate pr-2 ${currentSessionId === session.id ? 'text-indigo-700' : 'text-slate-700'}`}>{session.title}</span>
                        <button onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"><Trash2 size={14}/></button>
                     </div>
                     <div className="text-xs text-slate-400 flex justify-between">
                        <span className="truncate max-w-[70%]">{session.preview?.replace(/<[^>]*>?/gm, '').substring(0, 20)}...</span>
                        <span>{session.date}</span>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative">
         
         {/* Toggle Sidebar Button (Desktop/Mobile) */}
         {/* Only show if history is closed on mobile, or handle open logic */}
         <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
            className={`absolute top-4 left-4 z-10 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition-all ${isHistoryOpen ? 'md:hidden' : ''}`}
            title="ისტორია"
         >
            <Menu size={20} />
         </button>

         {/* Header */}
         <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between pl-16 md:pl-4">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                  <Bot size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">Gemini Math Tutor</h3>
                  <p className="text-[10px] md:text-xs text-slate-500">Gemini 2.5 Flash • Strict Context</p>
               </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => createNewSession(true)} 
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
               >
                  <Plus size={16} /> <span className="hidden sm:inline">ახალი ჩატი</span>
               </button>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            {messages.map((msg, idx) => (
               <div 
                  key={idx} 
                  className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start group'}`}
               >
                  <div 
                     className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 md:p-5 shadow-sm relative ${
                        msg.role === ChatRole.USER 
                           ? 'bg-indigo-600 text-white rounded-tr-none' 
                           : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                     }`}
                  >
                     {/* Role Icon */}
                     {msg.role === ChatRole.MODEL && (
                        <div className="absolute -left-10 top-0 p-2 bg-white border border-slate-200 rounded-full hidden md:block">
                           <Bot size={16} className="text-indigo-600" />
                        </div>
                     )}

                     <div className={`text-[15px] leading-relaxed font-medium`}>
                        <MathRenderer text={msg.text} className={msg.role === ChatRole.USER ? 'text-white' : 'text-slate-800'} />
                     </div>
                     
                     {/* Copy Button */}
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
                     <span className="text-xs text-slate-400">ფიქრობს და აანალიზებს...</span>
                  </div>
               </div>
            )}
            <div ref={scrollRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-white border-t border-slate-200 relative z-10">
            
            {/* Horizontal Image Preview Gallery */}
            {selectedImages.length > 0 && (
               <div className="flex gap-3 mb-3 overflow-x-auto pb-2 custom-scrollbar animate-in slide-in-from-bottom-2">
                  {selectedImages.map((img) => (
                     <div key={img.id} className="relative shrink-0 group">
                        <img 
                           src={`data:${img.mimeType};base64,${img.data}`} 
                           alt="Selected" 
                           className="h-24 w-auto rounded-lg border border-slate-200 shadow-sm object-cover"
                        />
                        <button 
                           onClick={() => removeImage(img.id)}
                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                           <X size={12} />
                        </button>
                     </div>
                  ))}
               </div>
            )}

            <div className="flex gap-2 items-end">
               <input
                  type="file"
                  multiple
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
                  <div className="relative">
                     <ImageIcon size={24} />
                     {selectedImages.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                           {selectedImages.length}
                        </span>
                     )}
                  </div>
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
                     placeholder={selectedImages.length > 0 ? "დაამატე კომენტარი სურათებზე..." : "დასვი კითხვა... (Ctrl+V სურათისთვის)"}
                     className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none max-h-32 min-h-[50px] shadow-inner"
                     rows={1}
                     style={{ height: 'auto' }}
                  />
                  <button 
                     onClick={toggleVoiceInput}
                     className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                     title="ხმოვანი კარნახი"
                  >
                     <Mic size={20} />
                  </button>
               </div>
               
               <button 
                  onClick={handleSend}
                  disabled={isTyping || (!input.trim() && selectedImages.length === 0)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-all shadow-md hover:scale-105 active:scale-95 mb-1"
               >
                  <Send size={20} />
               </button>
            </div>
         </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isHistoryOpen && (
         <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setIsHistoryOpen(false)}
         ></div>
      )}
    </div>
  );
};