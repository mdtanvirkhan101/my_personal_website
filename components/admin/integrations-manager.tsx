 "use client";

import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowUpRight, Bot, Check, CheckCircle2, ChevronRight,
  CircleHelp, Code2, Copy, Cpu, ExternalLink, Globe2, KeyRound, Layers3,
  Loader2, MessageCircle, MessageSquare, PlugZap, Save, Search, Send,
  Settings2, ShieldCheck, Sparkles, Terminal, Webhook, Workflow, Zap
} from "lucide-react";
import {
  saveAIIntegrationConfig,
  saveWebhookConfig,
  saveChannelCredentials,
  AIIntegrationConfig,
  WebhookConfig,
} from "@/actions/integrations";

interface IntegrationsManagerProps {
  initialAI: AIIntegrationConfig;
  initialWebhook: WebhookConfig;
  initialChannelCreds: any;
}

type Tab = "overview" | "ai" | "channels" | "webhooks" | "guidelines";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Layers3 },
  { id: "ai", label: "AI Providers", icon: Bot },
  { id: "channels", label: "Messaging", icon: MessageSquare },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "guidelines", label: "API Guides", icon: Code2 },
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400";
const panelClass = "rounded-2xl border border-white/[0.08] bg-[#111b2b]/80 shadow-[0_12px_40px_rgba(0,0,0,.16)]";

function StatusPill({ children, good = true }: { children: React.ReactNode; good?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
      good ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${good ? "bg-emerald-400" : "bg-amber-400"}`} />
      {children}
    </span>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function IntegrationsManager({
  initialAI,
  initialWebhook,
  initialChannelCreds,
}: IntegrationsManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [aiProvider, setAIProvider] = useState<string>(initialAI.provider || "gemini");
  const [aiApiKey, setAIApiKey] = useState<string>(initialAI.apiKey || "");
  const [aiModel, setAIModel] = useState<string>(initialAI.model || "gemini-1.5-flash");
  const [autoDraftReply, setAutoDraftReply] = useState<boolean>(initialAI.autoDraftReply ?? true);
  const [autoBlogAssist, setAutoBlogAssist] = useState<boolean>(initialAI.autoBlogAssist ?? true);
  const [aiLoading, setAILoading] = useState(false);
  const [aiSaved, setAISaved] = useState(false);

  const [webhookSecret, setWebhookSecret] = useState<string>(initialWebhook.webhookSecret || "");
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);

  const [waPhoneId, setWaPhoneId] = useState(initialChannelCreds?.whatsapp?.phoneNumberId || "");
  const [waToken, setWaToken] = useState(initialChannelCreds?.whatsapp?.accessToken || "");
  const [waAccountId, setWaAccountId] = useState(initialChannelCreds?.whatsapp?.businessAccountId || "");
  const [fbPageId, setFbPageId] = useState(initialChannelCreds?.facebook?.pageId || "");
  const [fbToken, setFbToken] = useState(initialChannelCreds?.facebook?.pageAccessToken || "");
  const [tgToken, setTgToken] = useState(initialChannelCreds?.telegram?.botToken || "");
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsSaved, setChannelsSaved] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const contentWebhookUrl = `${siteOrigin}/api/webhooks/content`;

  const configuredChannels = useMemo(
    () => [Boolean(waToken && waPhoneId), Boolean(fbToken && fbPageId), Boolean(tgToken)].filter(Boolean).length,
    [waToken, waPhoneId, fbToken, fbPageId, tgToken]
  );

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      alert("Could not copy to clipboard.");
    }
  };

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setAILoading(true);
    setAISaved(false);
    try {
      await saveAIIntegrationConfig({
        provider: aiProvider as any,
        apiKey: aiApiKey.trim(),
        model: aiModel.trim(),
        autoDraftReply,
        autoBlogAssist,
      });
      setAISaved(true);
      window.setTimeout(() => setAISaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save AI settings");
    } finally {
      setAILoading(false);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookLoading(true);
    setWebhookSaved(false);
    try {
      await saveWebhookConfig({
        webhookSecret: webhookSecret.trim(),
        allowedTypes: ["blog", "project", "service", "inbox"],
      });
      setWebhookSaved(true);
      window.setTimeout(() => setWebhookSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save Webhook settings");
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleSaveChannels = async (e: React.FormEvent) => {
    e.preventDefault();
    setChannelsLoading(true);
    setChannelsSaved(false);
    try {
      await saveChannelCredentials({
        whatsapp: { phoneNumberId: waPhoneId.trim(), accessToken: waToken.trim(), businessAccountId: waAccountId.trim() },
        facebook: { pageId: fbPageId.trim(), pageAccessToken: fbToken.trim() },
        telegram: { botToken: tgToken.trim() },
      });
      setChannelsSaved(true);
      window.setTimeout(() => setChannelsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save channel credentials");
    } finally {
      setChannelsLoading(false);
    }
  };

  const SaveButton = ({ loading, saved, children }: { loading: boolean; saved: boolean; children: React.ReactNode }) => (
    <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {loading ? "Saving..." : saved ? "Saved successfully" : children}
    </button>
  );

  const navTo = (tab: Tab) => setActiveTab(tab);

  return (
    <main className="min-h-screen space-y-7 bg-[#080f1b] p-4 text-slate-100 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-[#14253a] via-[#101c2d] to-[#0d1726] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.18em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> Control center
            </div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Cpu className="h-6 w-6" /></span>
              Integrations &amp; AI Automation Hub
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Manage AI providers, messaging channels and content webhooks from one secure workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill>Settings workspace active</StatusPill>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-slate-400">
              Environment <span className="ml-2 font-semibold text-slate-200">Production</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#0e1827] p-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => navTo(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === id ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10" : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "AI provider", value: aiProvider === "gemini" ? "Google Gemini" : aiProvider === "openai" ? "OpenAI" : aiProvider === "anthropic" ? "Anthropic" : "Custom API", sub: aiModel, icon: Bot, color: "text-violet-300", bg: "bg-violet-400/10" },
              { label: "Messaging channels", value: `${configuredChannels} / 3 connected`, sub: "WhatsApp · Messenger · Telegram", icon: MessageCircle, color: "text-emerald-300", bg: "bg-emerald-400/10" },
              { label: "Content webhook", value: webhookSecret ? "Configured" : "Needs setup", sub: "Inbound content endpoint", icon: Webhook, color: "text-amber-300", bg: "bg-amber-400/10" },
              { label: "Automation features", value: `${Number(autoDraftReply) + Number(autoBlogAssist)} enabled`, sub: "AI-assisted capabilities", icon: Zap, color: "text-cyan-300", bg: "bg-cyan-400/10" },
            ].map((item) => (
              <div key={item.label} className={`${panelClass} p-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.bg} ${item.color}`}><item.icon className="h-5 w-5" /></span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <div className={`${panelClass} p-6`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">Integration services</h2>
                  <p className="mt-1 text-xs text-slate-500">Quick access to your connected services</p>
                </div>
                <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">3 categories</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { title: "AI Providers", desc: "Model, API key and assistant settings", icon: Bot, status: aiApiKey ? "Credentials added" : "Setup required", tab: "ai" as Tab },
                  { title: "Messaging APIs", desc: "WhatsApp, Facebook and Telegram", icon: MessageSquare, status: `${configuredChannels} connected`, tab: "channels" as Tab },
                  { title: "Content Webhooks", desc: "Receive content from external tools", icon: Webhook, status: webhookSecret ? "Secret configured" : "Setup required", tab: "webhooks" as Tab },
                ].map((item) => (
                  <button key={item.title} onClick={() => navTo(item.tab)} className="group rounded-2xl border border-white/[0.08] bg-[#0b1422] p-4 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><item.icon className="h-5 w-5" /></span>
                      <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-300" />
                    </div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 min-h-9 text-xs leading-5 text-slate-500">{item.desc}</p>
                    <p className="mt-3 text-[11px] font-semibold text-cyan-300">{item.status}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className={`${panelClass} p-6`}>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <h2 className="text-base font-bold">Security checklist</h2>
              </div>
              <div className="space-y-4">
                {[
                  ["AI credentials", Boolean(aiApiKey)],
                  ["Messaging credentials", configuredChannels > 0],
                  ["Webhook secret", Boolean(webhookSecret)],
                ].map(([name, done]) => (
                  <div key={String(name)} className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0">
                    <span className="text-sm text-slate-300">{String(name)}</span>
                    {done ? <StatusPill>Configured</StatusPill> : <StatusPill good={false}>Action needed</StatusPill>}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-amber-300/10 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100/70">
                <AlertCircle className="mr-1 inline h-4 w-4" /> Keep API secrets server-side and never expose them in client-side code.
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "ai" && (
        <form onSubmit={handleSaveAI} className={`${panelClass} space-y-6 p-5 sm:p-7`}>
          <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-300" /><h2 className="text-lg font-bold">AI provider configuration</h2></div>
              <p className="mt-1 text-xs text-slate-500">Choose the model that powers your website's AI-assisted features.</p>
            </div>
            {aiSaved && <StatusPill>Saved successfully</StatusPill>}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="AI provider">
              <select value={aiProvider} onChange={(e) => {
                setAIProvider(e.target.value);
                if (e.target.value === "openai") setAIModel("gpt-4o");
                if (e.target.value === "gemini") setAIModel("gemini-1.5-flash");
                if (e.target.value === "anthropic") setAIModel("claude-3-5-sonnet");
              }} className={inputClass}>
                <option value="gemini">Google Gemini</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic Claude</option><option value="custom">Custom compatible API</option>
              </select>
            </Field>
            <Field label="Model name" hint="Enter the exact model identifier supported by your provider.">
              <input value={aiModel} onChange={(e) => setAIModel(e.target.value)} placeholder="e.g. gemini-1.5-flash or gpt-4o" className={inputClass} />
            </Field>
          </div>
          <Field label="API key" hint="Your key is submitted to the server action. Do not share it or expose it in browser code.">
            <div className="relative"><input type="password" value={aiApiKey} onChange={(e) => setAIApiKey(e.target.value)} placeholder="Paste provider API key" className={`${inputClass} pr-11 font-mono`} /><KeyRound className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" /></div>
          </Field>
          <div>
            <p className={labelClass}>Enabled AI capabilities</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0b1422] p-4 transition hover:border-violet-300/30">
                <input type="checkbox" checked={autoDraftReply} onChange={(e) => setAutoDraftReply(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
                <span><span className="block text-sm font-semibold">Auto-draft inbox replies</span><span className="mt-1 block text-xs leading-5 text-slate-500">Generate reply suggestions for client inquiries.</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0b1422] p-4 transition hover:border-violet-300/30">
                <input type="checkbox" checked={autoBlogAssist} onChange={(e) => setAutoBlogAssist(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
                <span><span className="block text-sm font-semibold">Article &amp; case study assistant</span><span className="mt-1 block text-xs leading-5 text-slate-500">Assist with technical articles and project case studies.</span></span>
              </label>
            </div>
          </div>
          <div className="flex justify-end border-t border-white/[0.08] pt-5"><SaveButton loading={aiLoading} saved={aiSaved}>Save AI settings</SaveButton></div>
        </form>
      )}

      {activeTab === "channels" && (
        <form onSubmit={handleSaveChannels} className={`${panelClass} space-y-6 p-5 sm:p-7`}>
          <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center">
            <div><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-emerald-300" /><h2 className="text-lg font-bold">Messaging channel credentials</h2></div><p className="mt-1 text-xs text-slate-500">Connect the channels used by your website inbox.</p></div>
            {channelsSaved && <StatusPill>Credentials saved</StatusPill>}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between"><h3 className="font-bold text-emerald-300">WhatsApp Business</h3><StatusPill good={Boolean(waPhoneId && waToken)}> {waPhoneId && waToken ? "Connected" : "Not connected"} </StatusPill></div>
              <div className="space-y-4">
                <Field label="Phone number ID"><input value={waPhoneId} onChange={(e) => setWaPhoneId(e.target.value)} placeholder="Phone Number ID" className={inputClass} /></Field>
                <Field label="Business account ID"><input value={waAccountId} onChange={(e) => setWaAccountId(e.target.value)} placeholder="WhatsApp Business Account ID" className={inputClass} /></Field>
                <Field label="Access token"><input type="password" value={waToken} onChange={(e) => setWaToken(e.target.value)} placeholder="Meta access token" className={inputClass} /></Field>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between"><h3 className="font-bold text-blue-300">Facebook Messenger</h3><StatusPill good={Boolean(fbPageId && fbToken)}>{fbPageId && fbToken ? "Connected" : "Not connected"}</StatusPill></div>
              <div className="space-y-4">
                <Field label="Facebook page ID"><input value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} placeholder="Facebook Page ID" className={inputClass} /></Field>
                <Field label="Page access token"><input type="password" value={fbToken} onChange={(e) => setFbToken(e.target.value)} placeholder="Page access token" className={inputClass} /></Field>
              </div>
            </div>
            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between"><h3 className="font-bold text-sky-300">Telegram Bot</h3><StatusPill good={Boolean(tgToken)}>{tgToken ? "Connected" : "Not connected"}</StatusPill></div>
              <Field label="Bot token"><input type="password" value={tgToken} onChange={(e) => setTgToken(e.target.value)} placeholder="Token from @BotFather" className={inputClass} /></Field>
            </div>
          </div>
          <div className="flex justify-end border-t border-white/[0.08] pt-5"><SaveButton loading={channelsLoading} saved={channelsSaved}>Save channel credentials</SaveButton></div>
        </form>
      )}

      {activeTab === "webhooks" && (
        <form onSubmit={handleSaveWebhook} className={`${panelClass} space-y-6 p-5 sm:p-7`}>
          <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center">
            <div><div className="flex items-center gap-2"><Webhook className="h-5 w-5 text-amber-300" /><h2 className="text-lg font-bold">Inbound content webhook</h2></div><p className="mt-1 text-xs text-slate-500">Receive blog posts, projects and services from external automation tools.</p></div>
            {webhookSaved && <StatusPill>Webhook secret saved</StatusPill>}
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
            <p className={labelClass}>Content ingestion endpoint</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <code className="min-w-0 flex-1 break-all rounded-xl border border-white/[0.08] bg-[#080f1b] px-4 py-3 text-xs text-cyan-200">{contentWebhookUrl}</code>
              <button type="button" onClick={() => copyText("url", contentWebhookUrl)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-white/5">{copiedKey === "url" ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copiedKey === "url" ? "Copied" : "Copy URL"}</button>
            </div>
          </div>
          <Field label="Webhook secret token" hint="Send this token as: Authorization: Bearer YOUR_SECRET. Store it securely.">
            <div className="flex flex-col gap-3 sm:flex-row"><input type="password" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="Set a strong, unique secret" className={inputClass} /><button type="button" onClick={() => copyText("secret", webhookSecret)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold hover:bg-white/5"><Copy className="h-4 w-4" />Copy secret</button></div>
          </Field>
          <div className="rounded-xl border border-white/[0.07] bg-[#0b1422] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Accepted content types</p>
            <div className="flex flex-wrap gap-2">{["blog", "project", "service", "inbox"].map((type) => <span key={type} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-300">{type}</span>)}</div>
          </div>
          <div className="flex justify-end border-t border-white/[0.08] pt-5"><SaveButton loading={webhookLoading} saved={webhookSaved}>Save webhook settings</SaveButton></div>
        </form>
      )}

      {activeTab === "guidelines" && (
        <section className="space-y-5">
          <div className={`${panelClass} p-5 sm:p-7`}>
            <div className="mb-4 flex items-center gap-2"><Terminal className="h-5 w-5 text-cyan-300" /><h2 className="text-lg font-bold">Publish content through webhook</h2></div>
            <p className="mb-4 text-sm leading-6 text-slate-400">Use this example in Zapier, Make, n8n or your own backend to send a blog post to your website.</p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#080f1b] p-4 text-xs leading-6 text-cyan-100">{`curl -X POST "${contentWebhookUrl}" \\
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "blog",
    "title": "New Article",
    "excerpt": "Article summary",
    "content": "Full article content..."
  }'`}</pre>
              <button type="button" onClick={() => copyText("curl", `curl -X POST "${contentWebhookUrl}" \\\n  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"blog","title":"New Article","excerpt":"Article summary","content":"Full article content..."}'`)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/5">{copiedKey === "curl" ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copiedKey === "curl" ? "Copied" : "Copy example"}</button>
            </div>
          </div>
          <div className={`${panelClass} p-5 sm:p-7`}>
            <div className="mb-4 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-emerald-300" /><h2 className="text-lg font-bold">Outgoing message flow</h2></div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {["Open the website inbox and select a conversation.", "Write a reply or generate an AI draft.", "Choose the connected messaging channel.", "Send the message through the configured provider API."].map((step, i) => <li key={step} className="flex gap-3 rounded-xl border border-white/[0.07] bg-[#0b1422] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-300">{i + 1}</span><span className="text-sm leading-6 text-slate-300">{step}</span></li>)}
            </ol>
          </div>
        </section>
      )}
      <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-slate-600 sm:flex-row">
        <span>Integrations &amp; AI Automation Hub</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Keep credentials private and server-side</span>
      </footer>
    </main>
  );
}
