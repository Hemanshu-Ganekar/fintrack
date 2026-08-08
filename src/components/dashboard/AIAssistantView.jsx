import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Loader2, User } from 'lucide-react';

const GEMINI_MODEL = 'gemma-4-26b-a4b-it';

// Vite: define VITE_GEMINI_API_KEY in your .env file.
// If you're on Create React App instead, use process.env.REACT_APP_GEMINI_API_KEY
// and add a `declare const process: any;` if TypeScript complains.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const base_url = import.meta.env.VITE_API_BASE_URL || 'http://fintrack-seven-rho.vercel.app/';
const AIAssistantView = ({ transactions = [], currency = 'Rs.' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(transactions);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setHistory(transactions);
  }, [transactions]);

  useEffect(() => {
    const loadHistory = async () => {
      const token = sessionStorage.getItem('fintrack_token');
      if (!token) return;

      try {
        const res = await fetch(`${base_url}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch {
        // Ignore and fall back to prop data.
      }
    };

    loadHistory();
  }, []);

  const formatTransactionsForPrompt = () => {
    const activeTransactions = Array.isArray(history) && history.length > 0 ? history : transactions;

    if (!activeTransactions || !activeTransactions.length) {
      return 'No transaction history available yet.';
    }

    return activeTransactions
      .slice(0, 25)
      .map((tx) => {
        const date = new Date(tx.rawDate || tx.date).toLocaleDateString('en-IN');
        const amount = Number(tx.amount || 0);
        const type = amount >= 0 ? 'income' : 'expense';
        const description = tx.description || tx.name || tx.category || 'No description';
        return `${date} | ${type} | ${currency} ${Math.abs(amount).toLocaleString()} | ${description}`;
      })
      .join('\n');
  };

  const buildPromptWithContext = (messageText) => {
    const transactionContext = formatTransactionsForPrompt();

    return `You are a helpful finance assistant. Use the user's transaction history below as context when answering.\n\nTransaction history (${currency}):\n${transactionContext}\n\nUser request:\n${messageText}`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!API_KEY) {
      setError('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file and restart the dev server.');
      return;
    }

    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const promptWithContext = buildPromptWithContext(text);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: nextMessages.map((m, index) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{
                text:
                  m.role === 'user' && index === nextMessages.length - 1
                    ? promptWithContext
                    : m.text,
              }],
            })),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Something went wrong talking to Gemini.');
      }

      const reply =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
        "I couldn't generate a response for that.";

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong talking to Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">AI Assistant</h2>
            <p className="text-sm text-slate-500">Your personal finance copilot, powered by Gemini.</p>
          </div>
        </div>

        {!API_KEY && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
            No Gemini API key found. Add <code className="font-mono">VITE_GEMINI_API_KEY=your-key</code> to a{' '}
            <code className="font-mono">.env</code> file at your project root, then restart the dev server.
          </p>
        )}

        {/* Chat area */}
        <div className="mt-6 flex h-96 flex-col rounded-2xl border border-slate-200 bg-slate-50/50">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Sparkles size={24} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-700">Ask me anything</h3>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Try "Give me 3 tips to save more this month" or "Explain what an emergency fund is."
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-600 border border-slate-200'
                  }`}
                >
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 border-t border-slate-200 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-xs text-rose-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AIAssistantView;
