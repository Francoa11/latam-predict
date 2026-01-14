import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: '¡Hola! Soy tu asistente de Latam Predict. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await sendChatMessage(input, history);
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">smart_toy</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[90vw] max-w-sm h-[60vh] bg-surface-dark border border-border-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-dark bg-background-dark/90">
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-primary">smart_toy</span>
           <h3 className="font-bold text-white">Asistente IA</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-card-dark text-slate-200 border border-border-dark'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-card-dark border border-border-dark rounded-xl p-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-background-dark border-t border-border-dark">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta algo..."
            className="flex-1 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;