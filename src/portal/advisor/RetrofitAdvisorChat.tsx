/**
 * src/portal/advisor/RetrofitAdvisorChat.tsx
 *
 * Phase 37 Homeowner Portal AI Retrofit Advisor Component
 * Route: /portal/advisor
 */

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Compass,
  ShieldCheck,
  Euro,
  Leaf,
} from 'lucide-react';
import { apiPost, apiGet } from '../../hooks/useApi';
import { AdvisorMessage } from '../../logic/advisor/retrofitAdvisorEngine';

export default function RetrofitAdvisorChat({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      role: 'assistant',
      text: 'Hello Sarah! I am your AI Retrofit Copilot. Ask me anything about your SEAI grant status, next steps, contractor quality scores, estimated energy savings, or carbon offsets.',
      at: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput('');
    const userMsg: AdvisorMessage = {
      role: 'user',
      text: userText,
      at: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setSending(true);
      const res = await apiPost('/api/advisor/chat', {
        user_id: userId,
        message: userText,
      });
      if (res && res.reply) {
        const assistantMsg: AdvisorMessage = {
          role: 'assistant',
          text: res.reply,
          at: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Advisor chat error', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="flex flex-col gap-4 text-left font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
                Phase 37 AI Retrofit Copilot
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Contextual Homeowner Guidance
            </h2>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] rounded-lg">
          Live Journey Context
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <button
          onClick={() => handleQuickPrompt('What is my next step?')}
          className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Compass size={13} className="text-emerald-400" />
          <span>What is my next step?</span>
        </button>

        <button
          onClick={() => handleQuickPrompt('What is my contractor score?')}
          className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck size={13} className="text-amber-400" />
          <span>What is my contractor score?</span>
        </button>

        <button
          onClick={() => handleQuickPrompt('How much money will I save?')}
          className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Euro size={13} className="text-indigo-400" />
          <span>How much money will I save?</span>
        </button>

        <button
          onClick={() => handleQuickPrompt('What is my carbon offset?')}
          className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Leaf size={13} className="text-emerald-400" />
          <span>What is my carbon offset?</span>
        </button>
      </div>

      {/* Chat Messages Window */}
      <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl min-h-[380px] max-h-[500px] overflow-y-auto flex flex-col gap-4 font-sans text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-[85%] ${
              m.role === 'user'
                ? 'ml-auto flex-row-reverse'
                : 'mr-auto flex-row'
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center h-8 w-8 shrink-0 ${
                m.role === 'user'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div
              className={`p-4 rounded-2xl leading-relaxed font-sans ${
                m.role === 'user'
                  ? 'bg-sky-600/20 border border-sky-500/30 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong>$1</strong>',
                  ),
                }}
              />
              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                {new Date(m.at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your AI Retrofit Advisor about next steps, savings, contractors..."
          className="flex-1 px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send size={14} className={sending ? 'animate-spin' : ''} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
