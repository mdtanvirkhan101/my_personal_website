"use client";

import { useState } from "react";
import {
  Building2,
  Quote,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Search,
  Sparkles,
  Star,
  Globe,
} from "lucide-react";
import {
  createClient,
  updateClient,
  deleteClient,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/actions/client";

interface ClientItem {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  testimonials?: TestimonialItem[];
}

interface TestimonialItem {
  id: string;
  clientId: string | null;
  clientName: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
  featured: boolean;
  createdAt: Date;
  client?: ClientItem | null;
}

interface ClientsManagerProps {
  initialClients: ClientItem[];
  initialTestimonials: TestimonialItem[];
}

export function ClientsManager({
  initialClients,
  initialTestimonials,
}: ClientsManagerProps) {
  const [tab, setTab] = useState<"clients" | "testimonials">("clients");
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);

  // Client form modal state
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Testimonial form modal state
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      (t.role && t.role.toLowerCase().includes(search.toLowerCase()))
  );

  // Client Form Submit
  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingClient) {
        await updateClient(formData);
        setStatusMessage({ type: "success", text: "Client updated successfully!" });
      } else {
        await createClient(formData);
        setStatusMessage({ type: "success", text: "Client created successfully!" });
      }
      setIsClientModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save client." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setLoading(true);

    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      setStatusMessage({ type: "success", text: "Client deleted." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete client." });
    } finally {
      setLoading(false);
    }
  };

  // Testimonial Form Submit
  const handleTestimonialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingTestimonial) {
        await updateTestimonial(formData);
        setStatusMessage({ type: "success", text: "Testimonial updated successfully!" });
      } else {
        await createTestimonial(formData);
        setStatusMessage({ type: "success", text: "Testimonial created successfully!" });
      }
      setIsTestimonialModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save testimonial." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setLoading(true);

    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter((t) => t.id !== id));
      setStatusMessage({ type: "success", text: "Testimonial deleted." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete testimonial." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enterprise Partnerships &amp; Social Proof</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Clients &amp; Testimonials Console
          </h1>
          <p className="text-xs text-slate-400">
            Manage partner logos, corporate affiliations, and client recommendations displayed across your public portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/clients"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0e0e34] border border-purple-500/30 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Public Page</span>
          </a>
          <button
            type="button"
            onClick={() => {
              if (tab === "clients") {
                setEditingClient(null);
                setIsClientModalOpen(true);
              } else {
                setEditingTestimonial(null);
                setIsTestimonialModalOpen(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{tab === "clients" ? "Add Client" : "Add Review"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 w-fit">
          <button
            type="button"
            onClick={() => setTab("clients")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              tab === "clients"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Clients ({clients.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("testimonials")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              tab === "testimonials"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Client Reviews ({testimonials.length})</span>
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* CLIENT FORM MODAL */}
      {isClientModalOpen && (
        <div className="p-6 rounded-3xl bg-[#141444] border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h2 className="text-base font-bold text-white font-heading">
              {editingClient ? `Edit Client: ${editingClient.name}` : "Add New Client"}
            </h2>
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/20"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleClientSubmit} className="space-y-4 text-xs">
            {editingClient && <input type="hidden" name="id" value={editingClient.id} />}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Client / Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={editingClient?.name || ""}
                required
                placeholder="e.g. Excel Technology Ltd. or Grandstream Networks"
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                name="website"
                defaultValue={editingClient?.website || ""}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Logo Image URL
              </label>
              <input
                type="text"
                name="logoUrl"
                defaultValue={editingClient?.logoUrl || ""}
                placeholder="https://.../logo.png"
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Client"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TESTIMONIAL FORM MODAL */}
      {isTestimonialModalOpen && (
        <div className="p-6 rounded-3xl bg-[#141444] border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h2 className="text-base font-bold text-white font-heading">
              {editingTestimonial ? `Edit Testimonial: ${editingTestimonial.clientName}` : "Add Client Testimonial"}
            </h2>
            <button
              type="button"
              onClick={() => setIsTestimonialModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-[#0e0e34] border border-purple-500/20"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleTestimonialSubmit} className="space-y-4 text-xs">
            {editingTestimonial && <input type="hidden" name="id" value={editingTestimonial.id} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Client / Author Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  defaultValue={editingTestimonial?.clientName || ""}
                  required
                  placeholder="e.g. John Doe, CTO"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  name="role"
                  defaultValue={editingTestimonial?.role || ""}
                  placeholder="e.g. Head of Infrastructure"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Associated Client Company (Optional)
                </label>
                <select
                  name="clientId"
                  defaultValue={editingTestimonial?.clientId || ""}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">None / Standalone Review</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  name="avatarUrl"
                  defaultValue={editingTestimonial?.avatarUrl || ""}
                  placeholder="https://.../avatar.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Testimonial Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="content"
                defaultValue={editingTestimonial?.content || ""}
                rows={3}
                required
                placeholder="Write the recommendation or client quote..."
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                defaultChecked={editingTestimonial?.featured}
                className="rounded border-purple-500/40 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="featured" className="text-slate-300 font-semibold">
                Feature prominently on home and clients page
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: CLIENTS GRID */}
      {tab === "clients" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#141444]/40 border border-purple-500/20 space-y-2">
              <Building2 className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Clients Found</h3>
              <p className="text-xs text-slate-400">Add corporate clients and company partners.</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-[#141444]/70 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#0e0e34] border border-purple-500/20 p-2 flex items-center justify-center">
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClient(client);
                          setIsClientModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white"
                        title="Edit client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1.5 rounded-lg bg-[#0e0e34] border border-rose-500/20 text-rose-400 hover:text-rose-300"
                        title="Delete client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-white">
                      {client.name}
                    </h3>
                    {client.website && (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-cyan-400 hover:underline inline-flex items-center space-x-1 mt-0.5"
                      >
                        <span>{client.website.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Reviews linked: {client.testimonials?.length || 0}</span>
                  <span className="text-cyan-400">Active</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: TESTIMONIALS LIST */}
      {tab === "testimonials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTestimonials.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#141444]/40 border border-purple-500/20 space-y-2">
              <Quote className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Testimonials Found</h3>
              <p className="text-xs text-slate-400">Add client reviews and recommendations.</p>
            </div>
          ) : (
            filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#141444]/70 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#0e0e34] border border-purple-500/20 overflow-hidden flex items-center justify-center text-cyan-400 font-bold">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                        ) : (
                          t.clientName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-bold text-white flex items-center space-x-1.5">
                          <span>{t.clientName}</span>
                          {t.featured && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-400">{t.role || "Client"}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonial(t);
                          setIsTestimonialModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#0e0e34] border border-purple-500/20 text-slate-300 hover:text-white"
                        title="Edit testimonial"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="p-1.5 rounded-lg bg-[#0e0e34] border border-rose-500/20 text-rose-400 hover:text-rose-300"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                {t.client && (
                  <div className="pt-2 border-t border-purple-500/20 text-[10px] font-mono text-cyan-400">
                    Company: {t.client.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
