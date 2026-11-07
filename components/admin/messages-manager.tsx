"use client";

import { useState } from "react";
import {
  Mail,
  Trash2,
  Clock,
  Check,
  Reply,
  MessageSquare,
  ExternalLink,
  Plus,
  BookOpen,
  Send,
  Phone,
  Copy,
  CheckCircle2,
  Loader2,
  X,
  Share2,
  Sparkles,
  CornerDownRight,
  Settings,
  ShieldCheck,
  Lock,
  Terminal,
  Download,
  RefreshCw,
  Filter,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Globe,
  Radio,
  Eye,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  updateMessageStatus,
  deleteContactMessage,
  createMultiChannelMessage,
  bulkUpdateMessageStatus,
  bulkDeleteContactMessages,
} from "@/actions/contact";
import { sendOutgoingChannelMessage } from "@/actions/channel-dispatch";
import { ContactPageConfig, defaultContactPageConfig } from "@/lib/contact-page-config";
import { saveContactPageConfig } from "@/actions/contact-page";
import Link from "next/link";

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  channel?: string | null;
  senderPhone?: string | null;
  platformSenderId?: string | null;
  metadata?: any;
  createdAt: Date | string;
}

interface MessagesManagerProps {
  initialMessages: ContactMessageItem[];
  initialConfig?: ContactPageConfig;
}

export function MessagesManager({ initialMessages, initialConfig }: MessagesManagerProps) {
  // Navigation Tabs: inbox | settings | integrations
  const [activeTab, setActiveTab] = useState<"inbox" | "settings" | "integrations">("inbox");

  // Messages State
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [activeChannel, setActiveChannel] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Reply Composer State
  const [replyModalMsg, setReplyModalMsg] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyResult, setReplyResult] = useState<{
    success: boolean;
    message?: string;
    deepLink?: string;
    error?: string;
    dispatchedViaApi?: boolean;
  } | null>(null);

  // New Message Form State
  const [formChannel, setFormChannel] = useState("WHATSAPP");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Contact Page Settings State
  const [settingsForm, setSettingsForm] = useState<ContactPageConfig>(
    initialConfig || defaultContactPageConfig
  );
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Status counters
  const totalCount = messages.length;
  const newCount = messages.filter((m) => m.status === "NEW").length;
  const readCount = messages.filter((m) => m.status === "READ").length;
  const repliedCount = messages.filter((m) => m.status === "REPLIED").length;
  const archivedCount = messages.filter((m) => m.status === "ARCHIVED").length;

  // Single Status Change
  const handleStatusChange = async (
    id: string,
    newStatus: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
  ) => {
    try {
      await updateMessageStatus(id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Delete Single Message
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus: "NEW" | "READ" | "REPLIED" | "ARCHIVED") => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      await bulkUpdateMessageStatus(selectedIds, newStatus);
      setMessages((prev) =>
        prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: newStatus } : m))
      );
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk status change error:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected messages?`)) {
      return;
    }
    setBulkLoading(true);
    try {
      await bulkDeleteContactMessages(selectedIds);
      setMessages((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Channel", "Name", "Email", "Phone", "Subject", "Status", "Date", "Message"];
    const rows = filteredMessages.map((m) => [
      m.id,
      m.channel || "WEBSITE",
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.senderPhone || "").replace(/"/g, '""')}"`,
      `"${(m.subject || "").replace(/"/g, '""')}"`,
      m.status,
      new Date(m.createdAt).toISOString(),
      `"${(m.message || "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contact_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Log External Message
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const res = await createMultiChannelMessage({
        channel: formChannel,
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        senderPhone: formPhone.trim() || undefined,
        subject: formSubject.trim() || undefined,
        message: formMessage.trim(),
        platformSenderId: formPhone.trim() || formName.trim(),
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to log message");
      }

      setMessages([res.data as any, ...messages]);
      setShowLogModal(false);
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormSubject("");
      setFormMessage("");
    } catch (err: any) {
      setFormError(err.message || "Failed to save message");
    } finally {
      setFormLoading(false);
    }
  };

  // Reply Composer
  const openReplyModal = (msg: ContactMessageItem) => {
    setReplyModalMsg(msg);
    setReplyText("");
    setReplyResult(null);
  };

  const handleDraftAI = () => {
    if (!replyModalMsg) return;
    const name = replyModalMsg.name || "there";
    const topic = replyModalMsg.subject ? ` regarding "${replyModalMsg.subject}"` : "";
    const draft = `Hello ${name},\n\nThank you for reaching out${topic}!\n\nI have received your inquiry and would be glad to assist you. Let me know what time works best for a brief consultation call or discussion.\n\nBest regards,\nMD Tanvir Khan`;
    setReplyText(draft);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalMsg || !replyText.trim()) return;

    setReplyLoading(true);
    setReplyResult(null);

    try {
      const res = await sendOutgoingChannelMessage({
        messageId: replyModalMsg.id,
        channel: replyModalMsg.channel || "WEBSITE",
        replyText: replyText.trim(),
        recipientPhone: replyModalMsg.senderPhone,
        platformSenderId: replyModalMsg.platformSenderId,
        recipientEmail: replyModalMsg.email,
      });

      if (!res.success) {
        setReplyResult({ success: false, error: res.error || "Failed to dispatch reply." });
      } else {
        setReplyResult(res);

        const newReplyEntry = {
          text: replyText.trim(),
          channel: (replyModalMsg.channel || "WEBSITE").toUpperCase(),
          dispatchedViaApi: res.dispatchedViaApi,
          sentAt: new Date().toISOString(),
        };

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === replyModalMsg.id) {
              const prevMeta = m.metadata || {};
              const prevReplies = Array.isArray(prevMeta.replies) ? prevMeta.replies : [];
              return {
                ...m,
                status: "REPLIED",
                metadata: {
                  ...prevMeta,
                  replies: [...prevReplies, newReplyEntry],
                },
              };
            }
            return m;
          })
        );
      }
    } catch (err: any) {
      setReplyResult({ success: false, error: err.message || "An unexpected error occurred." });
    } finally {
      setReplyLoading(false);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsFeedback(null);

    try {
      const res = await saveContactPageConfig(settingsForm);
      if (res.success) {
        setSettingsFeedback({
          type: "success",
          text: "Contact page settings updated successfully! Live page is updated.",
        });
        setTimeout(() => setSettingsFeedback(null), 4000);
      } else {
        setSettingsFeedback({
          type: "error",
          text: res.error || "Failed to update contact settings.",
        });
      }
    } catch (err: any) {
      setSettingsFeedback({
        type: "error",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm("Reset contact page configuration to defaults?")) {
      setSettingsForm(defaultContactPageConfig);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    // Channel filter
    if (activeChannel !== "ALL") {
      const ch = (m.channel || "WEBSITE").toUpperCase();
      if (activeChannel === "FACEBOOK" && !ch.startsWith("FACEBOOK")) return false;
      if (activeChannel !== "FACEBOOK" && ch !== activeChannel) return false;
    }

    // Status filter
    if (statusFilter !== "ALL" && m.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchPhone = m.senderPhone?.toLowerCase().includes(q);
      const matchSubject = m.subject?.toLowerCase().includes(q);
      const matchMessage = m.message?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchSubject && !matchMessage) {
        return false;
      }
    }

    return true;
  });

  // Channel badge helper
  const renderChannelBadge = (rawChannel?: string | null) => {
    const channel = (rawChannel || "WEBSITE").toUpperCase();

    if (channel === "WHATSAPP") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span>💬 WhatsApp</span>
        </span>
      );
    }
    if (channel === "FACEBOOK_PAGE") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <span>📘 Facebook Page</span>
        </span>
      );
    }
    if (channel === "FACEBOOK_PROFILE" || channel === "FACEBOOK") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <span>👤 Facebook Profile</span>
        </span>
      );
    }
    if (channel === "INSTAGRAM") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-600/20 text-pink-400 border border-pink-500/30">
          <span>📸 Instagram</span>
        </span>
      );
    }
    if (channel === "WECHAT") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-600/20 text-green-400 border border-green-500/30">
          <span>🟢 WeChat</span>
        </span>
      );
    }
    if (channel === "TELEGRAM") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <span>✈️ Telegram</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
        <span>🌐 Website Form</span>
      </span>
    );
  };

  const renderQuickLinkButton = (msg: ContactMessageItem) => {
    const ch = (msg.channel || "WEBSITE").toUpperCase();

    if (ch === "WHATSAPP") {
      const phone = (msg.senderPhone || msg.platformSenderId || msg.email || "").replace(/[^0-9]/g, "");
      const waUrl = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${msg.name}, thank you for reaching out!`)}`
        : `https://web.whatsapp.com`;
      return (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          title="Open WhatsApp Web directly"
        >
          <span>WhatsApp Web</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    if (ch.startsWith("FACEBOOK")) {
      const fbUrl = msg.platformSenderId
        ? `https://m.me/${msg.platformSenderId}`
        : "https://www.facebook.com/messages";
      return (
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          title="Open Messenger directly"
        >
          <span>Messenger</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    if (ch === "INSTAGRAM") {
      return (
        <a
          href="https://www.instagram.com/direct/inbox/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-pink-400 border border-pink-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          title="Open Instagram DM directly"
        >
          <span>Instagram DM</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    return (
      <a
        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Portfolio Inquiry")}`}
        className="px-2.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-sky-400 border border-sky-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        title="Open Email Client"
      >
        <span>Mail Client</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Live Form Link & Modals */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141444]/60 border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Mail className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Contact &amp; Inbox Management Console</span>
              {newCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse">
                  {newCount} New
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Manage client inquiries, reply directly, configure website contact details, and connect multi-channel webhooks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0e0e34] border border-cyan-500/30 text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live /contact Form</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Chat / Message</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "inbox"
              ? "bg-primary text-background shadow-glow"
              : "bg-surface-50 text-slate-300 hover:text-white border border-border-subtle"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>📬 Inbox &amp; Inquiries ({totalCount})</span>
          {newCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "inbox"
                  ? "bg-black/30 text-white"
                  : "bg-sky-500/20 text-sky-400"
              }`}
            >
              {newCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "settings"
              ? "bg-primary text-background shadow-glow"
              : "bg-surface-50 text-slate-300 hover:text-white border border-border-subtle"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>⚙️ Website Contact Page &amp; Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "integrations"
              ? "bg-primary text-background shadow-glow"
              : "bg-surface-50 text-slate-300 hover:text-white border border-border-subtle"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>⚡ Multi-Channel Integrations Guide</span>
        </button>
      </div>

      {/* TAB 1: INBOX & INQUIRIES */}
      {activeTab === "inbox" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-surface-50 border border-border-subtle">
              <span className="text-[11px] font-semibold text-slate-400 block">Total Messages</span>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1">{totalCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25">
              <span className="text-[11px] font-semibold text-sky-400 block">New / Unread</span>
              <div className="text-xl sm:text-2xl font-bold text-sky-300 mt-1">{newCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="text-[11px] font-semibold text-emerald-400 block">Replied Inquiries</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1">{repliedCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-border-subtle">
              <span className="text-[11px] font-semibold text-slate-400 block">Archived Inquiries</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-300 mt-1">{archivedCount}</div>
            </div>
          </div>

          {/* Search, Filter & Bulk Actions Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by sender, email, phone, subject, or keywords..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Status & CSV Export */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-surface-100 px-3 py-1.5 rounded-xl border border-border-subtle text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="READ">Read</option>
                  <option value="REPLIED">Replied</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                title="Export inquiries to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Channel Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveChannel("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "ALL"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              All Channels ({messages.length})
            </button>

            <button
              onClick={() => setActiveChannel("WEBSITE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "WEBSITE"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              🌐 Website ({messages.filter((m) => !m.channel || m.channel === "WEBSITE").length})
            </button>

            <button
              onClick={() => setActiveChannel("WHATSAPP")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "WHATSAPP"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              💬 WhatsApp ({messages.filter((m) => m.channel === "WHATSAPP").length})
            </button>

            <button
              onClick={() => setActiveChannel("FACEBOOK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "FACEBOOK"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              📘 Facebook ({messages.filter((m) => m.channel?.startsWith("FACEBOOK")).length})
            </button>

            <button
              onClick={() => setActiveChannel("INSTAGRAM")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "INSTAGRAM"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              📸 Instagram ({messages.filter((m) => m.channel === "INSTAGRAM").length})
            </button>

            <button
              onClick={() => setActiveChannel("WECHAT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "WECHAT"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              🟢 WeChat ({messages.filter((m) => m.channel === "WECHAT").length})
            </button>

            <button
              onClick={() => setActiveChannel("TELEGRAM")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChannel === "TELEGRAM"
                  ? "bg-primary text-background shadow-glow"
                  : "bg-surface-50 text-slate-400 hover:text-white border border-border-subtle"
              }`}
            >
              ✈️ Telegram ({messages.filter((m) => m.channel === "TELEGRAM").length})
            </button>
          </div>

          {/* Bulk Action Strip */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-xs text-white">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sky-400">{selectedIds.length}</span>
                <span>messages selected</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkStatusChange("READ")}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Mark as Read
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkStatusChange("REPLIED")}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Mark as Replied
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkStatusChange("ARCHIVED")}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Archive
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="glass-panel rounded-3xl border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {selectedIds.length === filteredMessages.length && filteredMessages.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-sky-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Select All ({filteredMessages.length})</span>
              </button>

              <span className="text-xs text-slate-400">
                Showing {filteredMessages.length} of {messages.length} messages
              </span>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto opacity-40" />
                <h3 className="text-sm font-semibold text-white">No messages found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "ALL" || activeChannel !== "ALL"
                    ? "No messages match your selected search criteria or channel filters."
                    : "Messages received from the website contact form, connected webhooks, or manually logged chats will appear here."}
                </p>
                {(searchQuery || statusFilter !== "ALL" || activeChannel !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                      setActiveChannel("ALL");
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-sky-400"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((msg) => {
                  const isSelected = selectedIds.includes(msg.id);
                  return (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-purple-900/20 border-purple-500/40"
                          : msg.status === "NEW"
                          ? "bg-surface-100/90 border-sky-500/40 shadow-glow/10"
                          : "bg-surface-50/70 border-border-subtle"
                      }`}
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(msg.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-sky-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          {renderChannelBadge(msg.channel)}

                          <span className="font-bold text-white text-sm">{msg.name}</span>

                          {msg.senderPhone && (
                            <span className="text-xs text-emerald-400 flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{msg.senderPhone}</span>
                            </span>
                          )}

                          {msg.email &&
                            !msg.email.includes(".user") &&
                            !msg.email.includes(".local") && (
                              <span className="text-xs text-slate-400">
                                &lt;{msg.email}&gt;
                              </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              msg.status === "NEW"
                                ? "bg-sky-500/20 text-sky-400"
                                : msg.status === "READ"
                                ? "bg-slate-700 text-slate-300"
                                : msg.status === "REPLIED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {msg.status}
                          </span>

                          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(msg.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Subject */}
                      {msg.subject && (
                        <div className="text-xs font-semibold text-sky-300 mt-3">
                          Subject: {msg.subject}
                        </div>
                      )}

                      {/* Message Body */}
                      <p className="text-xs text-slate-200 mt-2 leading-relaxed whitespace-pre-line bg-surface-100/40 p-4 rounded-xl border border-border-subtle">
                        {msg.message}
                      </p>

                      {/* Sent Reply History */}
                      {msg.metadata?.replies &&
                        Array.isArray(msg.metadata.replies) &&
                        msg.metadata.replies.length > 0 && (
                          <div className="mt-3 space-y-2 pt-3 border-t border-border-subtle">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-sky-400" />
                              <span>Sent Replies ({msg.metadata.replies.length})</span>
                            </span>
                            {msg.metadata.replies.map((reply: any, rIdx: number) => (
                              <div
                                key={rIdx}
                                className="bg-surface-100/80 p-3 rounded-xl border border-border-subtle text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                  <span className="font-semibold text-sky-400 flex items-center space-x-1.5">
                                    <span>Channel: {reply.channel || "CMS"}</span>
                                    {reply.dispatchedViaApi && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                        API Delivered
                                      </span>
                                    )}
                                  </span>
                                  <span>{reply.sentAt ? formatDate(reply.sentAt) : "Recently"}</span>
                                </div>
                                <p className="text-slate-200 whitespace-pre-line">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Status toggles & actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-border-subtle">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(msg.id, "NEW")}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              msg.status === "NEW"
                                ? "bg-sky-500/30 text-sky-300 border border-sky-500/40"
                                : "bg-surface-100 hover:bg-surface-200 text-slate-400"
                            }`}
                          >
                            Mark New
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(msg.id, "READ")}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              msg.status === "READ"
                                ? "bg-slate-700 text-white"
                                : "bg-surface-100 hover:bg-surface-200 text-slate-400 hover:text-white"
                            }`}
                          >
                            Mark Read
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(msg.id, "REPLIED")}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              msg.status === "REPLIED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            Mark Replied
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(msg.id, "ARCHIVED")}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              msg.status === "ARCHIVED"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-surface-100 hover:bg-surface-200 text-slate-400"
                            }`}
                          >
                            Archive
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => openReplyModal(msg)}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow flex items-center space-x-1.5 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Direct Reply</span>
                          </button>

                          {renderQuickLinkButton(msg)}

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE CONTACT PAGE CONTENT & SETTINGS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Feedback Banner */}
          {settingsFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2.5 ${
                settingsFeedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/15 border-red-500/30 text-red-300"
              }`}
            >
              {settingsFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{settingsFeedback.text}</span>
            </div>
          )}

          {/* Section 1: Hero & Intro Text */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Page Hero &amp; Heading</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure the top titles and introduction copy displayed on the public /contact page.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={settingsForm.badgeText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, badgeText: e.target.value })
                  }
                  placeholder="Secure Communication Channel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={settingsForm.headingMain}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, headingMain: e.target.value })
                  }
                  placeholder="Get in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Heading Highlight (Cyan)
                </label>
                <input
                  type="text"
                  value={settingsForm.headingHighlight}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, headingHighlight: e.target.value })
                  }
                  placeholder="Touch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Introductory Description
              </label>
              <textarea
                rows={3}
                value={settingsForm.description}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, description: e.target.value })
                }
                placeholder="Whether you need an enterprise network architecture audit, cybersecurity consultation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 2: Contact Information Details */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Contact Information Details</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official contact details shown in the left column on the contact page.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Professional Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={settingsForm.email}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, email: e.target.value })
                  }
                  placeholder="contact@tanvirkhan.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Box Label
                </label>
                <input
                  type="text"
                  value={settingsForm.emailLabel}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, emailLabel: e.target.value })
                  }
                  placeholder="Professional Domain Email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone / WhatsApp Number (Optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, phone: e.target.value })
                  }
                  placeholder="+880 1700-000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Box Label
                </label>
                <input
                  type="text"
                  value={settingsForm.phoneLabel}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, phoneLabel: e.target.value })
                  }
                  placeholder="Direct Phone / WhatsApp"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Location &amp; Timezone
                </label>
                <input
                  type="text"
                  value={settingsForm.location}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, location: e.target.value })
                  }
                  placeholder="Dhaka, Bangladesh • UTC+6 (Remote Friendly)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Response Window
                </label>
                <input
                  type="text"
                  value={settingsForm.responseWindow}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, responseWindow: e.target.value })
                  }
                  placeholder="Typically within 12–24 business hours"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Instant Quick Communication Buttons */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Direct Instant Chat Buttons</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enable fast 1-click WhatsApp or Telegram buttons under the contact info list.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.showDirectChatButtons}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      showDirectChatButtons: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  WhatsApp Direct Number (digits with country code)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                  }
                  placeholder="+8801700000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telegram Username (without @)
                </label>
                <input
                  type="text"
                  value={settingsForm.telegramUsername}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })
                  }
                  placeholder="tanvirkhan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security & Compliance Card */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Security &amp; Confidentiality Box</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays encryption standards, NDA assurance, and security disclosures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Security Card Title
                </label>
                <input
                  type="text"
                  value={settingsForm.securityBadgeTitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      securityBadgeTitle: e.target.value,
                    })
                  }
                  placeholder="Security & Encryption Standard"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Footer Trust Note
                </label>
                <input
                  type="text"
                  value={settingsForm.securityFooterNote}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      securityFooterNote: e.target.value,
                    })
                  }
                  placeholder="Protected by reCAPTCHA Enterprise & TLS 1.3 Encryption"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Security &amp; NDA Description Text
              </label>
              <textarea
                rows={3}
                value={settingsForm.securityDescription}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    securityDescription: e.target.value,
                  })
                }
                placeholder="All infrastructure briefings, network topology disclosures, and security audits..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 5: Inquiry Portal Form Controls & Availability */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Inquiry Portal Form Controls</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage the interactive form header, availability status, and confirmation messages.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-300">
                  {settingsForm.isFormActive ? "Form Active" : "Inquiries Paused"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.isFormActive}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        isFormActive: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Portal Header Title
                </label>
                <input
                  type="text"
                  value={settingsForm.formPortalTitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      formPortalTitle: e.target.value,
                    })
                  }
                  placeholder="Secure Inquiry Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Portal Subtitle
                </label>
                <input
                  type="text"
                  value={settingsForm.formPortalSubtitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      formPortalSubtitle: e.target.value,
                    })
                  }
                  placeholder="Fill out the form below to initiate direct communication."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Form Status Badge Text
                </label>
                <input
                  type="text"
                  value={settingsForm.formStatusBadge}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      formStatusBadge: e.target.value,
                    })
                  }
                  placeholder="Secure Node Active"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Paused Inquiries Notice (Shown when form is disabled)
              </label>
              <textarea
                rows={2}
                value={settingsForm.formInactiveNotice}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    formInactiveNotice: e.target.value,
                  })
                }
                placeholder="Inquiries are temporarily paused. Please reach out via email directly."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Delivered Success Confirmation Message
              </label>
              <textarea
                rows={2}
                value={settingsForm.formSuccessMessage}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    formSuccessMessage: e.target.value,
                  })
                }
                placeholder="Thank you for reaching out. Your communication has been dispatched directly to my inbox..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 6: Inbound Notifications Routing */}
          <div className="glass-panel p-6 rounded-3xl border border-border-subtle space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Admin Notification Routing</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify destination email for forwarding inquiry notifications.
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Notification Recipient Email
              </label>
              <input
                type="email"
                value={settingsForm.adminNotificationEmail}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    adminNotificationEmail: e.target.value,
                  })
                }
                placeholder="contact@tanvirkhan.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Bottom Save & Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleResetSettings}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center space-x-3">
              <Link
                href="/contact"
                target="_blank"
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs font-semibold text-sky-400 hover:text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview /contact</span>
              </Link>

              <button
                type="submit"
                disabled={settingsSaving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {settingsSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Contact Page Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: MULTI-CHANNEL INTEGRATIONS & WEBHOOKS GUIDE */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>Multi-Channel Inbox Integration Guide</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Receive and synchronize inquiries from WhatsApp Business, Facebook Page Messenger, Instagram DM, and WeChat in real-time.
              </p>
            </div>

            {/* Central Webhook Endpoint Box */}
            <div className="bg-surface-100/70 p-5 rounded-2xl border border-sky-500/30 space-y-3">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                Your Universal Webhook Endpoint
              </span>
              <div className="flex items-center justify-between bg-surface-50 p-3 rounded-xl border border-border-subtle">
                <code className="text-xs text-white font-mono truncate mr-2">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/webhooks/inbox`
                    : "/api/webhooks/inbox"}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "webhook",
                      `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/inbox`
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold shrink-0"
                >
                  {copiedText === "webhook" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedText === "webhook" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-surface-50 p-3 rounded-xl border border-border-subtle">
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 mr-2">Verification Secret Token:</span>
                  <code className="text-white font-mono">portfolio_webhook_token_2026</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("token", "portfolio_webhook_token_2026")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-semibold shrink-0"
                >
                  {copiedText === "token" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedText === "token" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Channels Breakdown */}
            <div className="space-y-4 text-xs text-slate-300">
              {/* WhatsApp */}
              <div className="p-5 rounded-2xl bg-surface-100/40 border border-border-subtle space-y-2.5">
                <h3 className="font-bold text-emerald-400 flex items-center space-x-2 text-sm">
                  <span>1. WhatsApp Business Cloud API</span>
                </h3>
                <p className="leading-relaxed">
                  In Meta Developer Portal (
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    className="text-sky-400 underline"
                  >
                    developers.facebook.com
                  </a>
                  ):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>
                    Create a Meta App with the <strong>WhatsApp</strong> product.
                  </li>
                  <li>
                    In WhatsApp &gt; Configuration, enter the Callback URL above &amp; Verify Token.
                  </li>
                  <li>
                    Subscribe to the <code className="text-sky-300 font-mono">messages</code>{" "}
                    webhook field.
                  </li>
                  <li>
                    Every incoming customer message will instantly appear in the Inbox console.
                  </li>
                </ol>
              </div>

              {/* Facebook Page & Instagram */}
              <div className="p-5 rounded-2xl bg-surface-100/40 border border-border-subtle space-y-2.5">
                <h3 className="font-bold text-blue-400 flex items-center space-x-2 text-sm">
                  <span>2. Facebook Page Messenger &amp; Instagram Direct</span>
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>
                    In Meta App Dashboard, add <strong>Messenger</strong> and{" "}
                    <strong>Instagram Graph API</strong>.
                  </li>
                  <li>
                    Set Webhook URL to the endpoint above and subscribe to{" "}
                    <code className="text-sky-300 font-mono">messages</code>.
                  </li>
                  <li>Connect your Facebook Page &amp; Instagram Professional Account.</li>
                </ol>
              </div>

              {/* WeChat */}
              <div className="p-5 rounded-2xl bg-surface-100/40 border border-border-subtle space-y-2.5">
                <h3 className="font-bold text-green-400 flex items-center space-x-2 text-sm">
                  <span>3. WeChat Official Account / Enterprise WeChat</span>
                </h3>
                <p className="leading-relaxed">
                  In WeChat Official Platform (
                  <a
                    href="https://mp.weixin.qq.com"
                    target="_blank"
                    className="text-sky-400 underline"
                  >
                    mp.weixin.qq.com
                  </a>
                  ):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>
                    Go to <strong>Development &gt; Basic Configuration &gt; Server Configuration</strong>.
                  </li>
                  <li>
                    URL: <code className="text-sky-300 font-mono">https://your-domain.com/api/webhooks/inbox</code>
                  </li>
                  <li>
                    Token: <code className="text-sky-300 font-mono">portfolio_webhook_token_2026</code>
                  </li>
                  <li>Save &amp; enable. Messages will be ingested automatically into your CMS.</li>
                </ol>
              </div>

              {/* Personal Accounts & Instant Logging */}
              <div className="p-5 rounded-2xl bg-surface-100/40 border border-border-subtle space-y-2.5">
                <h3 className="font-bold text-indigo-400 flex items-center space-x-2 text-sm">
                  <span>4. Personal Profile Chats &amp; Offline Calls</span>
                </h3>
                <p className="leading-relaxed text-slate-400">
                  For messages received on personal WhatsApp, Telegram, phone calls, or LinkedIn, use the <strong>&quot;+ Log Chat / Message&quot;</strong> button at the top to preserve client inquiries, track follow-ups, and keep a consolidated communication log.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Log New Message Form */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-subtle rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <span>Log External Message or Chat</span>
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-xl hover:bg-surface-100 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Origin Channel
                </label>
                <select
                  value={formChannel}
                  onChange={(e) => setFormChannel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="WHATSAPP">💬 WhatsApp (Direct / Business)</option>
                  <option value="FACEBOOK_PAGE">📘 Facebook Page (Messenger)</option>
                  <option value="FACEBOOK_PROFILE">👤 Facebook Profile (Personal Chat)</option>
                  <option value="INSTAGRAM">📸 Instagram Direct (DM)</option>
                  <option value="WECHAT">🟢 WeChat (Chat / Official)</option>
                  <option value="TELEGRAM">✈️ Telegram</option>
                  <option value="WEBSITE">🌐 Website Contact Form</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe / @username"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject / Inquiry Topic
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Infrastructure Architecture Project"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Message Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Paste or write the message received from client..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Save to Inbox</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Direct Reply Modal */}
      {replyModalMsg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-subtle rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Reply className="w-5 h-5 text-sky-400" />
                  <span>Send Direct Reply</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Replying to:</span>
                  <span className="text-xs font-bold text-white">{replyModalMsg.name}</span>
                  {renderChannelBadge(replyModalMsg.channel)}
                </div>
              </div>
              <button
                onClick={() => setReplyModalMsg(null)}
                className="p-1.5 rounded-xl hover:bg-surface-100 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original message context */}
            <div className="bg-surface-100/40 p-3 rounded-2xl border border-border-subtle text-xs text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Original Inquiry
              </span>
              <p className="line-clamp-3 italic text-slate-300">
                &ldquo;{replyModalMsg.message}&rdquo;
              </p>
            </div>

            {/* AI Assistant Quick Draft Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Compose your response:</span>
              <button
                type="button"
                onClick={handleDraftAI}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Draft Quick Reply</span>
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea
                required
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message to send directly to their inbox or chat..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-border-subtle text-white text-xs focus:outline-none focus:border-primary resize-none"
              />

              {replyResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    replyResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {replyResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{replyResult.message || replyResult.error}</span>
                  </div>

                  {replyResult.deepLink && (
                    <div className="pt-1">
                      <a
                        href={replyResult.deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-sky-400 font-bold border border-sky-500/30 transition-colors"
                      >
                        <span>Open Chat Link directly</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  {replyModalMsg.channel === "WHATSAPP" ||
                  replyModalMsg.channel?.startsWith("FACEBOOK")
                    ? "Dispatches via connected API or direct link"
                    : "Records reply in history & opens client"}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalMsg(null)}
                    className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={replyLoading || !replyText.trim()}
                    className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-primary hover:bg-sky-400 text-background text-xs font-bold shadow-glow disabled:opacity-50"
                  >
                    {replyLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
