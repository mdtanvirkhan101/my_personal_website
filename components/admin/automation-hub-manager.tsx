"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  Activity,
  Cpu,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText,
  Key,
  Layers,
  MessageSquare,
  Globe,
  Radio,
  ExternalLink,
} from "lucide-react";
import { saveAIProviderAction, testAIProviderAction } from "@/actions/automation-ai";
import { generateContentAction } from "@/actions/automation-content";
import { saveWorkflowAction, triggerManualWorkflowAction } from "@/actions/automation-workflows";
import { saveIntegrationAction, testIntegrationAction } from "@/actions/automation-integrations";

interface Props {
  initialOverview: any;
  initialProviders: any[];
  initialIntegrations: any[];
  initialWorkflows: any[];
}

export function AutomationHubManager({
  initialOverview,
  initialProviders,
  initialIntegrations,
  initialWorkflows,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "providers" | "content" | "workflows" | "integrations"
  >("overview");

  // Overview stats
  const stats = initialOverview?.stats || {
    totalWorkflows: 0,
    activeWorkflows: 0,
    pausedWorkflows: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalAiTokens: 0,
    totalEstimatedCost: 0,
    totalIntegrations: 0,
    activeIntegrations: 0,
  };

  const recentExecutions = initialOverview?.recentExecutions || [];

  // Content Studio state
  const [contentType, setContentType] = useState<any>("blog");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [generationMeta, setGenerationMeta] = useState<any>(null);

  // Provider states
  const [providers, setProviders] = useState(initialProviders);
  const [selectedProviderKey, setSelectedProviderKey] = useState("gemini");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);

  // Workflow trigger test
  const [triggeringWorkflowId, setTriggeringWorkflowId] = useState<string | null>(null);
  const [workflowNotice, setWorkflowNotice] = useState<string | null>(null);

  // Handle live AI testing
  const handleTestProvider = async (providerKey: string) => {
    setTestingProvider(providerKey);
    setTestResult(null);
    try {
      const res = await testAIProviderAction(providerKey, apiKeyInput || undefined);
      setTestResult({
        provider: providerKey,
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setTestResult({
        provider: providerKey,
        success: false,
        message: err.message,
      });
    } finally {
      setTestingProvider(null);
    }
  };

  // Handle Save AI Provider
  const handleSaveProvider = async (providerKey: string, name: string) => {
    try {
      const res = await saveAIProviderAction({
        providerKey,
        name,
        apiKey: apiKeyInput,
        isActive: true,
        isDefault: true,
      });
      if (res.success) {
        setTestResult({
          provider: providerKey,
          success: true,
          message: "API Key securely saved and set as active default.",
        });
        setApiKeyInput("");
      }
    } catch (err: any) {
      setTestResult({
        provider: providerKey,
        success: false,
        message: err.message,
      });
    }
  };

  // Handle Content Generation
  const handleGenerateContent = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedOutput("");
    try {
      const res = await generateContentAction({
        contentType,
        topicOrContext: topic,
      });
      if (res.success && res.content) {
        setGeneratedOutput(res.content);
        setGenerationMeta({
          provider: res.provider,
          model: res.model,
          tokens: res.tokens,
          cost: res.estimatedCost,
          durationMs: res.durationMs,
        });
      } else {
        setGeneratedOutput(`Error: ${res.error || "Generation failed"}`);
      }
    } catch (err: any) {
      setGeneratedOutput(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle manual workflow run
  const handleRunWorkflow = async (workflowId: string) => {
    setTriggeringWorkflowId(workflowId);
    setWorkflowNotice(null);
    try {
      const res = await triggerManualWorkflowAction(workflowId, { manualTest: true, testTrigger: "admin_ui" });
      if (res.success && 'executionId' in res) {
        setWorkflowNotice(`Workflow executed successfully! (ID: ${res.executionId})`);
      } else {
        setWorkflowNotice(`Execution failed: ${res.error}`);
      }
    } catch (err: any) {
      setWorkflowNotice(`Error: ${err.message}`);
    } finally {
      setTriggeringWorkflowId(null);
    }
  };

  const tabs = [
    { id: "overview", label: "Dashboard & Health", icon: Activity },
    { id: "providers", label: "AI Providers & Models", icon: Cpu },
    { id: "content", label: "Content Automation Studio", icon: Sparkles },
    { id: "workflows", label: "Workflow Builder", icon: Zap },
    { id: "integrations", label: "Integrations & Channels", icon: Radio },
  ];

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141444] via-[#10103b] to-[#0e0e34] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Centralized Automation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI &amp; Automation Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Orchestrate multi-provider AI services, background event triggers, Telegram/SMTP dispatches, content generation, and live execution analytics from one central hub.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-purple-500/20 gap-2 overflow-x-auto pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-t-2xl font-mono text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
                isActive
                  ? "bg-[#141444] border-cyan-500/40 text-cyan-300 shadow-lg border-b-transparent"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#141444]/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & DASHBOARD                               */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#141444] border border-cyan-500/20 rounded-2xl p-5 shadow-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Active Workflows</span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {stats.activeWorkflows} <span className="text-xs text-slate-500 font-normal">/ {stats.totalWorkflows}</span>
              </div>
            </div>

            <div className="bg-[#141444] border border-emerald-500/20 rounded-2xl p-5 shadow-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Successful Executions</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {stats.successfulExecutions}
              </div>
            </div>

            <div className="bg-[#141444] border border-purple-500/20 rounded-2xl p-5 shadow-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>AI Tokens Consumed</span>
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
              </span>
              <div className="text-2xl font-extrabold text-purple-300 font-mono">
                {stats.totalAiTokens.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#141444] border border-amber-500/20 rounded-2xl p-5 shadow-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Estimated AI Cost</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                ${stats.totalEstimatedCost}
              </div>
            </div>
          </div>

          {/* Recent Executions History */}
          <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/20 p-6 space-y-4 shadow-xl">
            <div className="border-b border-purple-500/20 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Recent Automation Executions</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live database records of event and workflow triggers.
                </p>
              </div>
            </div>

            {recentExecutions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-mono text-xs">
                No workflow executions recorded yet. Triggers will appear here live when contact forms or workflows fire.
              </div>
            ) : (
              <div className="divide-y divide-purple-500/10">
                {recentExecutions.map((exec: any) => (
                  <div key={exec.id} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="text-white font-semibold flex items-center space-x-2">
                        <span>{exec.workflowName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          exec.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {exec.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Trigger: {exec.triggerSource} • Duration: {exec.durationMs}ms
                      </div>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {new Date(exec.startedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AI PROVIDERS & MODELS                             */}
      {/* ========================================================= */}
      {activeTab === "providers" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#0e0e34] border border-cyan-500/20 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-cyan-500/20 pb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Multi-Provider AI Orchestration</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Configure OpenAI, Anthropic Claude, Google Gemini, DeepSeek, or custom endpoints. Credentials are encrypted using AES-256-GCM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Selection & Setup */}
              <div className="space-y-4">
                <label className="text-xs font-mono text-slate-300 font-semibold">Select AI Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "gemini", name: "Google Gemini" },
                    { key: "openai", name: "OpenAI" },
                    { key: "claude", name: "Anthropic Claude" },
                    { key: "deepseek", name: "DeepSeek" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        setSelectedProviderKey(p.key);
                        setTestResult(null);
                      }}
                      className={`px-4 py-3 rounded-xl border text-xs font-mono font-semibold transition-all text-left ${
                        selectedProviderKey === p.key
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-lg"
                          : "bg-[#141444] border-purple-500/20 text-slate-300 hover:border-purple-500/40"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                    <span>API Key ({selectedProviderKey.toUpperCase()})</span>
                    <span className="text-[10px] text-cyan-400">Encrypted at rest</span>
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Paste your API key here (sk-... or AIzaSy...)"
                    className="w-full bg-[#141444] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestProvider(selectedProviderKey)}
                    disabled={testingProvider !== null}
                    className="px-4 py-2.5 rounded-xl bg-[#141444] hover:bg-[#1c1c5e] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    <Radio className={`w-3.5 h-3.5 ${testingProvider ? "animate-spin" : ""}`} />
                    <span>{testingProvider ? "Testing Connection..." : "Test Connection"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProvider(selectedProviderKey, selectedProviderKey.toUpperCase())}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-500/25 transition-all"
                  >
                    Save &amp; Set Active
                  </button>
                </div>

                {testResult && testResult.provider === selectedProviderKey && (
                  <div className={`p-4 rounded-xl text-xs font-mono border animate-in fade-in ${
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Status & Catalog Info */}
              <div className="bg-[#141444]/60 border border-purple-500/20 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <div className="text-white font-bold flex items-center space-x-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Configured Provider Hierarchy</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When content automation or AI assistants execute, requests attempt the default active provider first. If rate-limited or unavailable, the system transparently escalates to the next active provider in the hierarchy.
                </p>
                <div className="pt-2 divide-y divide-purple-500/10 text-[11px]">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Google Gemini (Default)</span>
                    <span className="text-emerald-400">gemini-1.5-flash / pro</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">OpenAI</span>
                    <span className="text-purple-300">gpt-4o / mini</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Anthropic Claude</span>
                    <span className="text-amber-300">claude-3-5-sonnet</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">DeepSeek</span>
                    <span className="text-cyan-300">deepseek-chat / coder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CONTENT AUTOMATION STUDIO                         */}
      {/* ========================================================= */}
      {activeTab === "content" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-purple-500/20 pb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>AI Content Automation Studio</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Generate technical blog posts, project case studies, SEO metadata, and translations with human-in-the-loop approval.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Form Column */}
              <div className="lg:col-span-5 space-y-4 font-mono">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Content Workflow</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full bg-[#141444] border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="blog">Technical Blog Post (Markdown)</option>
                    <option value="case_study">Case Study (Problem, Solution, Outcome)</option>
                    <option value="seo">SEO Metadata (JSON)</option>
                    <option value="translation">Bilingual Translation (Bangla/English)</option>
                    <option value="summary">Executive Summary &amp; Bullets</option>
                    <option value="social">Social Media Captions (LinkedIn &amp; X)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Prompt / Topic Context</label>
                  <textarea
                    rows={6}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter the topic, rough notes, project details, or draft text to enhance..."
                    className="w-full bg-[#141444] border border-purple-500/30 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-mono font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Generating Content with AI..." : "Generate Content"}</span>
                </button>
              </div>

              {/* Output Preview Column */}
              <div className="lg:col-span-7 bg-[#141444] border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-purple-500/10 pb-2 text-xs font-mono">
                    <span className="text-white font-semibold">Generated Output Preview</span>
                    {generationMeta && (
                      <span className="text-[10px] text-cyan-300">
                        {generationMeta.model} • {generationMeta.tokens} tokens • {generationMeta.durationMs}ms
                      </span>
                    )}
                  </div>
                  <textarea
                    readOnly
                    rows={12}
                    value={generatedOutput}
                    placeholder="Your AI-generated content will appear here for review and editing before publication."
                    className="w-full bg-[#0e0e34] border border-purple-500/10 rounded-xl p-4 text-xs text-slate-200 font-mono resize-none focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      if (generatedOutput) navigator.clipboard.writeText(generatedOutput);
                    }}
                    disabled={!generatedOutput}
                    className="px-4 py-2 rounded-xl bg-[#0e0e34] hover:bg-[#1a1a52] border border-slate-700 text-slate-300 disabled:opacity-40"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: WORKFLOW BUILDER                                  */}
      {/* ========================================================= */}
      {activeTab === "workflows" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-purple-500/20 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Event-Driven Workflow Automation</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Connect platform events (e.g. Contact Form Submission) to multi-step actions (Telegram alert, email dispatch, AI summary).
                </p>
              </div>
            </div>

            {workflowNotice && (
              <div className="p-4 rounded-xl text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                {workflowNotice}
              </div>
            )}

            <div className="space-y-4">
              {/* Default Active Workflow Card */}
              <div className="bg-[#141444] border border-purple-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                      <span>Inbound Contact Automation Pipeline</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Trigger: On NEW_CONTACT_MESSAGE submitted from website
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunWorkflow(initialWorkflows[0]?.id || "default")}
                    disabled={triggeringWorkflowId !== null}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${triggeringWorkflowId ? "animate-spin" : ""}`} />
                    <span>Run Test Pipeline</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-[#0e0e34] border border-purple-500/20 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-cyan-400">Step 1 • Action</span>
                    <div className="text-white font-semibold">AI Inquiry Summary</div>
                    <p className="text-[10px] text-slate-400">Generates 2-sentence executive summary</p>
                  </div>
                  <div className="bg-[#0e0e34] border border-purple-500/20 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-cyan-400">Step 2 • Action</span>
                    <div className="text-white font-semibold">Telegram Bot Dispatch</div>
                    <p className="text-[10px] text-slate-400">Sends instant alert to Admin Telegram</p>
                  </div>
                  <div className="bg-[#0e0e34] border border-purple-500/20 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-cyan-400">Step 3 • Action</span>
                    <div className="text-white font-semibold">Dashboard Notification</div>
                    <p className="text-[10px] text-slate-400">Creates unread notification card in CMS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INTEGRATIONS & CHANNELS                           */}
      {/* ========================================================= */}
      {activeTab === "integrations" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#0e0e34] border border-purple-500/25 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-purple-500/20 pb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Radio className="w-5 h-5 text-sky-400" />
                <span>External Integration Connectors</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Configure real Telegram Bot API and Email credentials for automated dispatches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telegram Connector */}
              <div className="bg-[#141444] border border-sky-500/20 rounded-2xl p-5 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-sky-500/15 pb-3">
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-bold text-white">Telegram Bot API</span>
                  </div>
                  <span className="text-[10px] text-sky-400">Communication</span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold">Telegram Bot Token</label>
                  <input
                    type="password"
                    placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                    className="w-full bg-[#0e0e34] border border-sky-500/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-400 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold">Admin Chat ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321"
                    className="w-full bg-[#0e0e34] border border-sky-500/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-400 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => testIntegrationAction("telegram")}
                    className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#1a1a52] border border-sky-500/30 text-sky-300 text-xs font-semibold"
                  >
                    Test Telegram
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>

              {/* Email / SMTP Connector */}
              <div className="bg-[#141444] border border-purple-500/20 rounded-2xl p-5 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">Email Dispatcher (Resend / SMTP)</span>
                  </div>
                  <span className="text-[10px] text-purple-300">Communication</span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold">Resend API Key (Optional)</label>
                  <input
                    type="password"
                    placeholder="re_123456789..."
                    className="w-full bg-[#0e0e34] border border-purple-500/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-400 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold">Notification Recipient Email</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full bg-[#0e0e34] border border-purple-500/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-400 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => testIntegrationAction("smtp")}
                    className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#1a1a52] border border-purple-500/30 text-purple-300 text-xs font-semibold"
                  >
                    Test Email
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
