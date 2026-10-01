import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Phone
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';
import { chatAPI } from '../services/api';

/**
 * Lightweight helper to render formatted text with bold, bullets, and line breaks
 */
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  // Split by double newline for paragraphs
  const paragraphs = content.split('\n\n');

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        // Check for bullet lines
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
              const isNumbered = /^\d+\.\s/.test(trimmed);

              // Parse bold tokens **text**
              const parts = (isBullet || isNumbered ? trimmed.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '') : line).split(/(\*\*.*?\*\*)/g);

              const formattedParts = parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={i} className="text-[#E5D2A8] font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                    <span className="text-[#C9A96E] text-xs leading-5 select-none">•</span>
                    <span className="flex-1">{formattedParts}</span>
                  </div>
                );
              }

              if (isNumbered) {
                const num = trimmed.match(/^(\d+)\./)?.[1] || '1';
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                    <span className="text-[#C9A96E] font-bold text-[11px] leading-5 select-none">{num}.</span>
                    <span className="flex-1">{formattedParts}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className={lIdx > 0 ? 'mt-1' : ''}>
                  {formattedParts}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const WhatsAppWidget = () => {
  const { brand: liveBrand } = useSite();
  const brand = liveBrand || siteConfig.brand || {};
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Chat Configuration from DB (null until loaded to prevent visual flashing)
  const [chatConfig, setChatConfig] = useState(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Conversation history: [{ id, role: 'bot' | 'user', content, timestamp }]
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch live chat settings from DB on mount
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const res = await chatAPI.getConfig();
        if (res?.data && isMounted) {
          setChatConfig(res.data);
          setIsConfigLoaded(true);
          // Set initial welcome greeting if empty
          if (res.data.welcomeMessage) {
            setMessages((prev) =>
              prev.length === 0
                ? [
                    {
                      id: 'welcome-0',
                      role: 'bot',
                      content: res.data.welcomeMessage,
                      timestamp: new Date(),
                    },
                  ]
                : prev
            );
          }
        }
      } catch (err) {
        console.warn('[WhatsAppWidget] Failed to fetch chat config:', err.message);
        if (isMounted) {
          setIsConfigLoaded(true);
        }
      }
    };

    loadConfig();

    const handleSettingsUpdated = () => {
      loadConfig();
    };
    window.addEventListener('site-settings-updated', handleSettingsUpdated);
    window.addEventListener('storage', handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('site-settings-updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleSettingsUpdated);
    };
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isStreaming]);

  // Handle Opening Widget
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  // Open Direct WhatsApp conversation with Studio Director
  const handleWhatsAppDirect = (customText) => {
    const message =
      customText ||
      inputMsg ||
      'Namaste! I would like to inquire about wedding photography availability and bespoke packages with Prazna Photography.';
    const cleanNumber = (brand.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Send message to AI and stream response token-by-token
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMsg || '').trim();
    if (!text || isStreaming) return;

    setInputMsg('');

    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now()}`;

    // 1. Add user message
    const updatedMessages = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: text,
        timestamp: new Date(),
      },
      {
        id: botMessageId,
        role: 'bot',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ];

    setMessages(updatedMessages);
    setIsStreaming(true);

    // Prepare history payload for API (role: 'user' | 'assistant')
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-0' && m.id !== 'welcome-default')
      .slice(-6)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    try {
      abortControllerRef.current = new AbortController();

      await chatAPI.streamMessage({
        message: text,
        history: historyPayload,
        signal: abortControllerRef.current.signal,
        onToken: (token, fullText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, content: fullText, isStreaming: true }
                : msg
            )
          );
        },
        onComplete: (fullText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, content: fullText || msg.content, isStreaming: false }
                : msg
            )
          );
          setIsStreaming(false);
        },
        onError: (err) => {
          console.error('[Chat Widget Stream Error]', err);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    content:
                      (msg.content ? msg.content + '\n\n' : '') +
                      '*(Namaste, our direct concierge line is also available via WhatsApp for instant date confirmation).*',
                    isStreaming: false,
                  }
                : msg
            )
          );
          setIsStreaming(false);
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[Chat Widget Error]', err);
      }
      setIsStreaming(false);
    }
  };

  // Reset conversation to fresh state
  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'bot',
        content:
          chatConfig.welcomeMessage ||
          'Namaste & Welcome to Prazna Photography. I am your AI Concierge. How may I assist with your wedding celebration or cinematic heirloom today?',
        timestamp: new Date(),
      },
    ]);
  };

  // Strictly hide widget if chatbot is disabled by admin in settings
  if (!isConfigLoaded || !chatConfig || chatConfig.enabled === false) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* ================================================================= */}
      {/* Expanded AI Concierge Modal                                       */}
      {/* ================================================================= */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[410px] h-[560px] max-h-[82vh] bg-[#0E1119] border border-[#C9A96E]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-fade-in transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#161B26] via-[#121622] to-[#0E1119] p-4 border-b border-white/10 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A96E]/25 to-[#C9A96E]/5 text-[#C9A96E] flex items-center justify-center border border-[#C9A96E]/40 shadow-inner">
                  <Sparkles className="w-5 h-5 fill-[#C9A96E]/30 text-[#C9A96E]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#121622] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {chatConfig.botName || 'Prazna AI Concierge'}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30 uppercase">
                    {chatConfig.activeProvider || 'gemini'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Streaming • 24/7 Royal Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* WhatsApp Fast Action */}
              <button
                type="button"
                onClick={() => handleWhatsAppDirect()}
                title="Connect directly on WhatsApp"
                className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
              </button>

              {/* Reset Chat */}
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#090C12]/90 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => {
              const isBot = msg.role === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center shrink-0 border border-[#C9A96E]/30 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] text-xs p-3.5 rounded-2xl leading-relaxed shadow-md ${
                      isBot
                        ? 'bg-[#141824] text-slate-200 border border-white/10 rounded-tl-sm'
                        : 'bg-gradient-to-r from-[#C9A96E] to-[#B38F4E] text-black font-medium rounded-tr-sm shadow-[0_4px_15px_rgba(201,169,110,0.25)]'
                    }`}
                  >
                    {isBot ? (
                      <div>
                        <FormattedMessage content={msg.content} />
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C9A96E] animate-pulse align-middle" />
                        )}
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Pills */}
          {chatConfig.quickQuestions && chatConfig.quickQuestions.length > 0 && (
            <div className="px-3 py-2 bg-[#0E1119] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
              {chatConfig.quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  disabled={isStreaming}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-[#C9A96E]/15 text-slate-300 hover:text-[#C9A96E] border border-white/10 hover:border-[#C9A96E]/40 text-[11px] transition-all shrink-0 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-white/10 bg-[#121622] space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isStreaming ? 'AI is crafting your response...' : 'Ask about packages, dates, pricing...'}
                value={inputMsg}
                disabled={isStreaming}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isStreaming) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-[#0A0D14] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] disabled:opacity-50 transition-colors"
              />

              <button
                type="button"
                disabled={!inputMsg.trim() || isStreaming}
                onClick={() => handleSendMessage()}
                aria-label="Send message"
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] hover:opacity-90 disabled:opacity-40 text-black font-bold transition-all shadow-md shrink-0"
              >
                {isStreaming ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
              </button>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                Powered by <strong className="text-[#C9A96E] capitalize">{chatConfig.activeProvider || 'Gemini'} AI</strong>
              </span>

              <button
                type="button"
                onClick={() => handleWhatsAppDirect()}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>WhatsApp Director</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Floating Trigger Pill                                             */}
      {/* ================================================================= */}
      <button
        onClick={toggleWidget}
        aria-label="Open AI Concierge Chat"
        className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#141824] via-[#161C2C] to-[#121622] hover:from-[#181F30] hover:to-[#161B28] text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-[#C9A96E]/50 hover:border-[#C9A96E] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-[#C9A96E]" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <span>{chatConfig.botName || 'AI Concierge'}</span>
          </div>
          <div className="text-[10px] text-[#C9A96E] font-medium">
            Ask Royal Packages & Dates
          </div>
        </div>

        {/* WhatsApp Secondary Icon badge */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleWhatsAppDirect();
          }}
          title="Direct WhatsApp"
          className="ml-1 p-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
        </div>
      </button>
    </div>
  );
};
