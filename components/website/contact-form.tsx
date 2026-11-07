"use client";

import { useState } from "react";
import { submitContactMessage } from "@/actions/contact";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ContactForm({
  prefilledSubject = "",
  successMessage,
}: {
  prefilledSubject?: string;
  successMessage?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [channel, setChannel] = useState("WEBSITE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await submitContactMessage({
        name,
        email,
        phone,
        channel,
        subject,
        message,
        honeypot,
      });

      if (res.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        setError(res.error || "Failed to submit message.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#5A7FC8]/40 text-center space-y-4 shadow-card"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#252E8A] to-[#00D2D3] border border-[#5A7FC8]/40 text-[#FFFFFF] mx-auto flex items-center justify-center shadow-glow-cyan">
          <CheckCircle2 className="w-8 h-8 text-[#FFFFFF]" />
        </div>
        <h3 className="font-heading text-xl font-bold text-[#FFFFFF]">Inquiry Delivered Successfully!</h3>
        <p className="text-xs sm:text-sm text-[#DCE3F6] max-w-md mx-auto leading-relaxed font-normal">
          {successMessage || "Thank you for reaching out. Your communication has been dispatched directly to my inbox. I will review and reply within 24 hours."}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 px-6 py-3 rounded-xl bg-[#141444] hover:bg-[#1A1A52] border border-[#5A7FC8]/35 text-xs font-semibold text-[#FFFFFF] transition-colors min-h-[44px]"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#5A7FC8]/25 shadow-card space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Anti-spam honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp">Website</label>
        <input
          id="website-hp"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#DCE3F6] mb-1.5 font-sans">
            Your Name <span className="text-[#2DD4BF] font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-4 py-3 rounded-xl bg-[#0E0E34]/90 border border-[#5A7FC8]/30 text-[#FFFFFF] placeholder:text-[#9BB0DD]/50 text-sm focus:outline-none focus:border-[#789BE0] focus:ring-1 focus:ring-[#789BE0]/40 transition-all min-h-[44px]"
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#DCE3F6] mb-1.5 font-sans">
            Email Address <span className="text-[#2DD4BF] font-bold">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="w-full px-4 py-3 rounded-xl bg-[#0E0E34]/90 border border-[#5A7FC8]/30 text-[#FFFFFF] placeholder:text-[#9BB0DD]/50 text-sm focus:outline-none focus:border-[#789BE0] focus:ring-1 focus:ring-[#789BE0]/40 transition-all min-h-[44px]"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#DCE3F6] mb-1.5 font-sans">
            Phone / Messaging Handle (Optional)
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3 rounded-xl bg-[#0E0E34]/90 border border-[#5A7FC8]/30 text-[#FFFFFF] placeholder:text-[#9BB0DD]/50 text-sm focus:outline-none focus:border-[#789BE0] focus:ring-1 focus:ring-[#789BE0]/40 transition-all min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#DCE3F6] mb-1.5 font-sans">
            Subject (Optional)
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Next.js Monolith & Design System"
            className="w-full px-4 py-3 rounded-xl bg-[#0E0E34]/90 border border-[#5A7FC8]/30 text-[#FFFFFF] placeholder:text-[#9BB0DD]/50 text-sm focus:outline-none focus:border-[#789BE0] focus:ring-1 focus:ring-[#789BE0]/40 transition-all min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#DCE3F6] mb-1.5 font-sans">
          Project Brief / Message <span className="text-[#2DD4BF] font-bold">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your vision, goals, timeline, and how we can collaborate..."
          className="w-full px-4 py-3 rounded-xl bg-[#0E0E34]/90 border border-[#5A7FC8]/30 text-[#FFFFFF] placeholder:text-[#9BB0DD]/50 text-sm focus:outline-none focus:border-[#789BE0] focus:ring-1 focus:ring-[#789BE0]/40 transition-all resize-none"
        />
        {fieldErrors.message && (
          <p className="text-xs text-red-400 mt-1">{fieldErrors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-bold text-sm shadow-lg shadow-purple-500/25 border border-purple-400/30 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[48px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Transmitting to Inbox...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 text-white" />
            <span>Send Direct Message</span>
          </>
        )}
      </button>
    </form>
  );
}
