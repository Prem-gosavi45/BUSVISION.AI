import React, { useState } from 'react';
import { Send, Bot, User, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBox({ isOpen, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Greetings Commander. I am BusVision Urban Telemetry AI. You can query fleet status, active potholes on FC Road/JM Road, traffic bottlenecks, or dispatch repair crews.',
      time: '10:30 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Acknowledged. Telemetry node reports all 142 buses operational with nominal telemetry sync.";
      const lower = userText.toLowerCase();

      if (lower.includes('pothole') || lower.includes('fc road') || lower.includes('paud')) {
        reply = "Analysis: FC Road Sector 4 currently has 1 critical pothole detected by BUS_101 (depth: 78mm, confidence: 84%). Paud Road has 1 verified defect scheduled for cold-mix asphalt dispatch.";
      } else if (lower.includes('traffic') || lower.includes('jm road') || lower.includes('congestion')) {
        reply = "JM Road Deccan Gymkhana corner is experiencing peak morning congestion (density: 76%, avg speed 7.2 km/h). Adaptive signal timings have been suggested for Deccan rotary.";
      } else if (lower.includes('bus') || lower.includes('fleet') || lower.includes('101')) {
        reply = "BUS_101 is on FC Road Sector 4 (GPS 18.503079, 73.773163). Telemetry ping active 12 seconds ago. 29 vehicles in optical detection frame.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 w-96 max-w-[90vw] bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#FAFAFA] dark:bg-[#182234] border-b border-[#E1E5E8] dark:border-[#334155] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-[#0055ce] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#18212B] dark:text-[#f3f4f6]">
              BusVision Telemetry Assistant
            </h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              Online · Pune Hub
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#5F6872] dark:text-[#9ca3af] hover:text-[#18212B] dark:hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="p-3.5 space-y-3 h-72 overflow-y-auto custom-scroll text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                m.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-[#E5EFFD] dark:bg-blue-900 text-[#0055ce] dark:text-blue-300'
              }`}
            >
              {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div
              className={`max-w-[78%] rounded-lg p-2.5 ${
                m.sender === 'user'
                  ? 'bg-[#0055ce] text-white'
                  : 'bg-[#F4F5F2] dark:bg-[#131b28] text-[#18212B] dark:text-[#f3f4f6] border border-[#E1E5E8] dark:border-[#334155]'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <span
                className={`text-[9px] block text-right mt-1 font-mono ${
                  m.sender === 'user' ? 'text-blue-100' : 'text-[#5F6872] dark:text-[#9ca3af]'
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-1.5 text-xs text-[#5F6872] dark:text-[#9ca3af] italic">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Consulting transit telemetry node...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[#E1E5E8] dark:border-[#334155] bg-white dark:bg-[#1e293b] flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about potholes, congestion, buses..."
          className="flex-1 text-xs px-3 py-1.5 bg-[#F4F5F2] dark:bg-[#131b28] border border-[#E1E5E8] dark:border-[#334155] rounded-md text-[#18212B] dark:text-[#f3f4f6] placeholder-[#5F6872] focus:outline-none focus:border-primary"
        />
        <button
          onClick={handleSend}
          className="p-1.5 bg-[#0055ce] hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
