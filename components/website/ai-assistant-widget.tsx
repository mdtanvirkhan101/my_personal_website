"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am MD Tanvir Khan's AI Assistant. How can I help you explore his VoIP, network architecture, and software development solutions?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setInput(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Connect to unified /api/ai/chat route
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText }),
      });

      const data = await res.json();
      let replyText = data.reply;

      if (!replyText) {
        // Fallback intelligent response
        const lower = userMsgText.toLowerCase();
        if (lower.includes("voip") || lower.includes("pbx") || lower.includes("grandstream")) {
          replyText = "Tanvir has deep expertise in Grandstream IP PBX systems, FXO/FXS gateways, IVR setup, and multi-branch VoIP infrastructure with high uptime.";
        } else if (lower.includes("network") || lower.includes("mikrotik") || lower.includes("cisco")) {
          replyText = "Tanvir specializes in enterprise LAN/WAN architecture, MikroTik routing, VLAN design, and stateful firewall security.";
        } else if (lower.includes("contact") || lower.includes("hire")) {
          replyText = "You can reach out directly via the 'Contact' page or WhatsApp (+8801601501775).";
        } else {
          replyText = "Thank you for asking! Tanvir is a Network & VoIP Engineer specializing in reliable infrastructure and web systems. Feel free to explore his Projects or Case Studies!";
        }
      }

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Tanvir specializes in VoIP, MikroTik routing, and full-stack architecture. Feel free to send a message via the Contact form!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/25 border border-cyan-400/40 focus:outline-none"
            aria-label="Open AI Assistant"
          >
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md group-hover:blur-lg transition-all" />
            <Bot className="w-6 h-6 text-white relative z-10" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-[#0e0e34] rounded-full z-20" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[380px] h-[520px] rounded-3xl bg-[#0e0e34]/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#141444]/90 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 font-heading">
                    <span>Tanvir&apos;s Assistant</span>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Voice &amp; AI Enabled</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAi = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${isAi ? "" : "flex-row-reverse space-x-reverse"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                        isAi
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-purple-600/20 border-purple-500/30 text-purple-300"
                      }`}
                    >
                      {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                        isAi
                          ? "bg-[#141444] border border-purple-500/20 text-slate-200 rounded-tl-sm"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-tr-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400">
                        {isAi && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            className="hover:text-cyan-400 flex items-center space-x-0.5"
                            title="Listen"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3 h-3 text-rose-400" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <span className="ml-auto">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[#141444] border border-slate-800 rounded-2xl px-3.5 py-2.5 rounded-tl-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer with Mic */}
            <form onSubmit={handleSend} className="p-3 bg-[#0e0e34] border-t border-purple-500/20 flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl border transition-all ${
                  isListening
                    ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                    : "bg-[#141444] border-purple-500/20 text-slate-400 hover:text-cyan-400"
                }`}
                title={isListening ? "Listening... click to stop" : "Speak to Assistant"}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about skills, VoIP, projects..."}
                className="flex-1 bg-[#141444] border border-cyan-500/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
