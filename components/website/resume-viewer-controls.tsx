"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  Eye,
  ExternalLink,
  X,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  ShieldCheck,
  Briefcase,
  Award,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface ResumeViewerControlsProps {
  resumeDownloadUrl: string;
  candidateData?: {
    name: string;
    headline: string;
    bio: string;
    location: string;
    phone: string;
    email: string;
    linkedin?: string;
    photoUrl?: string;
    skillsList?: any[];
    trainingList?: any[];
    educationList?: any[];
    referencesList?: any[];
    experiences: any[];
    certifications: any[];
  };
}

export function ResumeViewerControls({
  resumeDownloadUrl,
  candidateData,
}: ResumeViewerControlsProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "pdf_raw">("document");

  const effectivePdfUrl = resumeDownloadUrl || "/api/resume-pdf";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const name = candidateData?.name || "MD TANVIR KHAN";
  const headline = candidateData?.headline || "Network & VoIP Engineer";
  const bio = candidateData?.bio || "";
  const location = candidateData?.location || "Kuril, Bhatara, Dhaka-1229, Bangladesh";
  const phone = candidateData?.phone || "+8801601501775";
  const email = candidateData?.email || "mdtanvirkhan.nt@gmail.com";
  const linkedin = candidateData?.linkedin || "https://linkedin.com/in/mdtanvirkhan101/";
  const photoUrl = candidateData?.photoUrl || "/uploads/cv_photo_extracted.jpg";

  const skills = candidateData?.skillsList || [];
  const training = candidateData?.trainingList || [];
  const education = candidateData?.educationList || [];
  const references = candidateData?.referencesList || [];
  const experiences = candidateData?.experiences || [];
  const certifications = candidateData?.certifications || [];

  return (
    <>
      {/* Top Action Toolbar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141444]/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0e0e34] text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <span>Curriculum Vitae (CV)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                ATS Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Instant Interactive View · Direct Print · Download</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. View / Preview CV Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
            title="Open Interactive CV Document Viewer"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>View CV Document</span>
          </button>

          {/* 2. Print CV Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
            title="Print or Save as PDF via Browser"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print CV</span>
          </button>

          {/* 3. Direct Download PDF */}
          <a
            href={effectivePdfUrl}
            download="CV_of_MD_Tanvir_Khan.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>

          {/* 4. Interview Link */}
          <Link
            href="/contact?subject=Interview%20Invitation"
            className="px-4 py-2.5 rounded-xl bg-[#0e0e34] hover:bg-[#1f2066] border border-purple-500/40 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center space-x-1"
          >
            <span>Schedule Interview</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* 100% Reliable CV Document Viewer Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl h-[92vh] rounded-3xl bg-[#0e0e34] border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header Bar */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#141444]/95 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                    Interactive Curriculum Vitae (CV) Dossier
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("document")}
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md transition-colors ${
                        activeTab === "document"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Formatted Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pdf_raw")}
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md transition-colors ${
                        activeTab === "pdf_raw"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Raw PDF Stream
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1.5 border border-cyan-500/30 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <a
                  href={effectivePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center space-x-1.5 border border-purple-500/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 w-full bg-[#0a0a24] overflow-y-auto p-4 sm:p-8">
              {activeTab === "document" ? (
                /* Ultra-clean, formatted document exactly mirroring the official PDF */
                <div className="max-w-3xl mx-auto rounded-2xl bg-white text-[#111827] p-8 sm:p-12 font-sans shadow-2xl space-y-6 text-[13px] leading-relaxed">
                  
                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-4 border-b border-slate-300">
                    <div className="space-y-1.5 flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0f172a]">
                        {name}
                      </h1>
                      <div className="text-xs sm:text-[13px] text-[#334155] leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{location}</span>
                        <span className="text-slate-400 font-bold">|</span>
                        <span>{phone}</span>
                        <span className="text-slate-400 font-bold">|</span>
                        <span>{email}</span>
                        <span className="text-slate-400 font-bold">|</span>
                        <span className="text-blue-700 font-medium">
                          {linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 self-center sm:self-start">
                      <div className="w-24 h-28 border-2 border-slate-300 rounded-md overflow-hidden bg-slate-100 shadow-sm">
                        <img
                          src={photoUrl}
                          alt={name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1. PROFESSIONAL SUMMARY */}
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                      PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-justify leading-relaxed text-[#334155]">
                      {bio}
                    </p>
                  </div>

                  {/* 2. TECHNICAL & SOFT SKILLS SUMMARY */}
                  {skills.length > 0 && (
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                        TECHNICAL &amp; SOFT SKILLS SUMMARY
                      </h2>
                      <ul className="list-disc pl-5 space-y-1 text-[#334155]">
                        {skills.map((sk: any, idx: number) => (
                          <li key={idx}>
                            <strong className="text-[#0f172a]">{sk.category}:</strong> {sk.details}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. KEY CERTIFICATIONS */}
                  <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                      KEY CERTIFICATIONS
                    </h2>
                    <div className="space-y-1.5 text-[#334155]">
                      {certifications.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {certifications.map((cert) => (
                            <li key={cert.id}>
                              <strong className="text-[#0f172a]">{cert.name}</strong> - [{cert.issuer}]
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <>
                          <div>
                            <div className="font-bold text-[#0f172a]">Fortinet Certifications:</div>
                            <ul className="list-disc pl-5">
                              <li>1. Fortinet Certified Associate Cybersecurity (FCAC) - (Credential ID: 6294254047MT)</li>
                            </ul>
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a]">MikroTik Certifications:</div>
                            <ul className="list-disc pl-5">
                              <li>1. MikroTik Certified Network Associate (MTCNA) - (Credential ID: 2501NA9093)</li>
                            </ul>
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a]">Grandstream Certified Specialist:</div>
                            <ul className="list-disc pl-5">
                              <li>1. UC Solution - (Credential ID: GS97577EB7179F)</li>
                              <li>2. Networking Solution - (Credential ID: GS9AD0B624CA9F)</li>
                            </ul>
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a]">Cisco Certifications:</div>
                            <ul className="list-disc pl-5">
                              <li>1. Network Support &amp; Security</li>
                              <li>2. Networking Basics</li>
                            </ul>
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a]">Ruijie Certifications:</div>
                            <ul className="list-disc pl-5">
                              <li>1. RCNA-WLAN - (Certificate ID: 46745)</li>
                              <li>2. RCNA - Routing &amp; Switching (Certificate ID: 72155)</li>
                            </ul>
                          </div>
                          <div>
                            <ul className="list-disc pl-5">
                              <li><strong className="text-[#0f172a]">OCNA Routing &amp; Switching</strong> (Credential ID: 1FAF185A593B4AF0)</li>
                              <li><strong className="text-[#0f172a]">Google IT Support Specialization</strong> (Credential ID: J23GF9LG23BU)</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 4. PROFESSIONAL EXPERIENCE */}
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                      PROFESSIONAL EXPERIENCE
                    </h2>
                    
                    {experiences.length > 0 ? (
                      <div className="space-y-3">
                        {experiences.map((exp, idx) => (
                          <div key={exp.id} className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                              <span>{idx + 1}. {exp.organization} — {exp.role}</span>
                            </div>
                            {exp.description && (
                              <p className="text-[#334155] leading-relaxed">{exp.description}</p>
                            )}
                            {Array.isArray(exp.attachments) && exp.attachments.length > 0 && (
                              <ul className="list-disc pl-5 space-y-1 text-[#334155]">
                                {exp.attachments.map((line: any, aIdx: number) => (
                                  <li key={aIdx}>{String(line)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                            <span>1. Excel Technology Ltd. — Associate Engineer</span>
                            <span className="font-semibold text-xs text-[#475569]">(1 Sep 2024 – Present)</span>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-[#334155]">
                            <li><strong className="text-[#0f172a]">Deploy and Configure:</strong> Successfully deployed and configured Grandstream Network Solutions and IP PBX Solutions to ensure a stable communication infrastructure for clients.</li>
                            <li><strong className="text-[#0f172a]">Video Conferencing Integration:</strong> Set up, tested, and provided full technical deployment for Logitech and Aver Video Conferencing solutions.</li>
                            <li><strong className="text-[#0f172a]">R&amp;D and Feature Testing:</strong> Conducted continuous Research &amp; Development (R&amp;D) and rigorous testing of new technical features to optimize system performance and reliability.</li>
                            <li><strong className="text-[#0f172a]">Client Demos &amp; BOQ Preparation:</strong> Conducted live technical demonstrations for clients and actively participated in preparing Bill of Materials (BOQ) for various Networking, IP PBX &amp; video conferencing projects.</li>
                            <li><strong className="text-[#0f172a]">Technical Support:</strong> Diagnosed and resolved network-level and system configuration issues to minimize downtime and maintain high security standards.</li>
                          </ul>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                            <span>2. Excel Technology Ltd. — Intern</span>
                            <span className="font-semibold text-xs text-[#475569]">(Feb 2024 – 31 Aug 2024)</span>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-[#334155]">
                            <li><strong className="text-[#0f172a]">Learned Cisco &amp; MikroTik:</strong> Learned how to configure and set up Cisco and MikroTik routers and switches.</li>
                            <li><strong className="text-[#0f172a]">Assisted with IP PBX:</strong> Helped senior engineers set up and test Grandstream IP PBX solutions and IP phones.</li>
                            <li><strong className="text-[#0f172a]">Video Conferencing Setup:</strong> Learned how to install and test Logitech and Aver video conferencing hardware.</li>
                            <li><strong className="text-[#0f172a]">Lab Testing &amp; R&amp;D:</strong> Helped the team test new network features and hardware devices in the lab.</li>
                            <li><strong className="text-[#0f172a]">Basic IT Support:</strong> Assisted in basic computer hardware troubleshooting and kept network system records.</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 5. PROFESSIONAL TRAINING */}
                  {training.length > 0 && (
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                        PROFESSIONAL TRAINING
                      </h2>
                      <div className="space-y-1">
                        {training.map((t: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                              <span>{t.title}</span>
                              <span className="font-semibold text-xs text-[#475569]">{t.duration}</span>
                            </div>
                            <p className="text-justify text-[#334155] leading-relaxed">
                              {t.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. EDUCATION */}
                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                        EDUCATION
                      </h2>
                      <div className="space-y-1.5 text-[#334155]">
                        {education.map((ed: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <strong className="text-[#0f172a]">{ed.degree}</strong>
                              <div className="text-xs text-[#475569]">{ed.institution}</div>
                            </div>
                            <span className="text-xs font-semibold text-[#475569]">{ed.period}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. REFERENCES */}
                  {references.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                        REFERENCES
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#334155]">
                        {references.map((ref: any, idx: number) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="font-bold text-sm text-[#0f172a]">{ref.name}</div>
                            <div className="text-[#475569]">{ref.title}</div>
                            <div className="text-[#475569]">{ref.organization}</div>
                            <div>
                              <span>Phone: </span>
                              <span className="text-[#0f172a] font-medium">{ref.phone}</span>
                            </div>
                            <div>
                              <span>Email: </span>
                              <span className="text-[#0f172a] font-medium">{ref.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Raw PDF Viewer stream */
                <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <iframe
                    src={`${effectivePdfUrl}#toolbar=1&navpanes=0`}
                    title="PDF Viewer"
                    className="w-full h-full border-none min-h-[600px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
