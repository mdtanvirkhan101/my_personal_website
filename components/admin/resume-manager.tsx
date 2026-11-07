"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  User,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  ShieldCheck,
  Award,
  Briefcase,
  GraduationCap,
  BookOpen,
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { updateResumeSettings } from "@/actions/resume";
import { FileUploadInput } from "@/components/admin/file-upload-input";
import Link from "next/link";

interface ResumeManagerProps {
  initialProfile: {
    name: string;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    resumeUrl: string | null;
    email: string | null;
    location: string | null;
    socialLinks: any;
  } | null;
  initialSettings: Record<string, any>;
  experiences: any[];
  certifications: any[];
}

export function ResumeManager({
  initialProfile,
  initialSettings,
  experiences,
  certifications,
}: ResumeManagerProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Core values
  const [resumeUrl, setResumeUrl] = useState(
    initialSettings["resume_pdf_url"] || initialProfile?.resumeUrl || "/uploads/1793964968919-CV_of_MD_Tanvir_Khan.pdf"
  );
  const [photoUrl, setPhotoUrl] = useState(
    initialSettings["resume_photo_url"] || initialProfile?.avatarUrl || "/uploads/cv_photo_extracted.jpg"
  );

  const socialLinks = initialProfile?.socialLinks as any;
  const currentPhone = initialSettings["contact_phone"] || socialLinks?.phone || "+8801601501775";
  const currentLocation = initialSettings["resume_location"] || initialProfile?.location || "Kuril, Bhatara, Dhaka-1229, Bangladesh";
  const currentLinkedin = initialSettings["resume_linkedin"] || socialLinks?.linkedin || "https://linkedin.com/in/mdtanvirkhan101/";

  // Editable Training
  const defaultTraining = [
    {
      title: "1. ISDB-BISEW IT Scholarship Programme — Network Systems Administrator",
      duration: "(6 June 2023 – 25 October 2023)",
      description:
        "I completed a training programme on computer systems and networking basics. I learned how to install, set up & manage Windows Server and virtual machines. I also learned how to make a system more secure, manage user access and find security threats. I studied the basic ideas of ethical hacking as well. Besides that, I worked with MikroTik to configure network devices, set up basic routing & manage bandwidth. I also completed CCNA Basic with hands-on lab practice.",
    },
  ];

  // Editable Education
  const defaultEducation = [
    {
      degree: "1. BSc in Computer Science & Technology",
      institution: "Canadian University of Bangladesh",
      period: "(March 2024 – Present)",
    },
    {
      degree: "2. Diploma in Computer Technology",
      institution: "Gopalganj Polytechnic Institute",
      period: "(March 2018 – May 2023)",
    },
    {
      degree: "3. Secondary School Certificate",
      institution: "Chandana High School & College",
      period: "(Jan 2016 – Feb 2018)",
    },
  ];

  // Editable References
  const defaultReferences = [
    {
      name: "A.F.M Bakabillah",
      title: "Consultant",
      organization: "ISDB-BISEW IT Scholarship Programme",
      phone: "01955625240",
      email: "rbillah01@gmail.com",
    },
    {
      name: "Abdullah Al Mahbub",
      title: "Instructor/Trainer",
      organization: "ISDB-BISEW IT Scholarship Programme",
      phone: "01912330796",
      email: "mahdi01912330796@gmail.com",
    },
  ];

  // Editable Technical Skills
  const defaultSkills = [
    {
      category: "Networking & Security",
      details: "Routing & Switching, TCP/IP, DHCP, DNS, VPN, Firewalls, Network Design, LAN/WAN Infrastructure.",
    },
    {
      category: "VoIP & Unified Communications",
      details: "Grandstream IP PBX, Unified Communications Manager (UCM), FXO/FXS Gateways, IVR, Call Center Technologies, SIP Trunking.",
    },
    {
      category: "Systems & Automation",
      details: "Windows Server Administration, Active Directory, Virtualization.",
    },
    {
      category: "Audio-Visual Systems",
      details: "Logitech & Aver Video Conferencing, Interactive Flat Panels (IFP), IP-PA Systems.",
    },
    {
      category: "IT Support",
      details: "Troubleshooting, Diagnostic Tools, Technical Documentation, Lab R&D.",
    },
  ];

  const [skillsList, setSkillsList] = useState<any[]>(
    Array.isArray(initialSettings["resume_skills_custom"]) && initialSettings["resume_skills_custom"].length > 0
      ? initialSettings["resume_skills_custom"]
      : defaultSkills
  );

  const [trainingList, setTrainingList] = useState<any[]>(
    Array.isArray(initialSettings["resume_training_custom"]) && initialSettings["resume_training_custom"].length > 0
      ? initialSettings["resume_training_custom"]
      : defaultTraining
  );

  const [educationList, setEducationList] = useState<any[]>(
    Array.isArray(initialSettings["resume_education_custom"]) && initialSettings["resume_education_custom"].length > 0
      ? initialSettings["resume_education_custom"]
      : defaultEducation
  );

  const [referencesList, setReferencesList] = useState<any[]>(
    Array.isArray(initialSettings["resume_references_custom"]) && initialSettings["resume_references_custom"].length > 0
      ? initialSettings["resume_references_custom"]
      : defaultReferences
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    const formData = new FormData(e.currentTarget);

    formData.append("skillsJson", JSON.stringify(skillsList));
    formData.append("trainingJson", JSON.stringify(trainingList));
    formData.append("educationJson", JSON.stringify(educationList));
    formData.append("referencesJson", JSON.stringify(referencesList));

    try {
      await updateResumeSettings(formData);
      setStatusMessage({ type: "success", text: "Resume and CV settings updated successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update resume." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141444]/80 border border-purple-500/25 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full CV &amp; Resume Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Resume &amp; CV Management
          </h1>
          <p className="text-xs text-slate-400">
            Control the public &amp; printable CV: candidate info, passport photo, PDF file, summary, skills, experience links, certifications, training, education, and references.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Preview Public Resume</span>
            <ExternalLink className="w-3 h-3" />
          </a>
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

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono uppercase">Work History</div>
            <div className="text-sm font-bold text-white">
              {experiences.length} Roles Active
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono uppercase">Credentials</div>
            <div className="text-sm font-bold text-white">
              {certifications.length} Certifications
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono uppercase">Academic &amp; Training</div>
            <div className="text-sm font-bold text-white">
              {educationList.length + trainingList.length} Records
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141444]/60 border border-purple-500/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono uppercase">ATS Format</div>
            <div className="text-sm font-bold text-white">100% Verified</div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Section 1: Official PDF & Passport Photo */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Official CV PDF File &amp; Passport Photo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <FileUploadInput
                name="resumeUrl"
                value={resumeUrl}
                onChange={(val) => setResumeUrl(val)}
                accept=".pdf,application/pdf"
                placeholder="/uploads/my-cv.pdf"
                label="Downloadable Official PDF File"
                helpText="Visitors can download this exact PDF when clicking 'Download PDF'."
              />
              <div className="pt-1">
                <a
                  href={resumeUrl || "/api/resume-pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-[#0e0e34] border border-cyan-500/40 text-cyan-400 hover:text-white transition-colors inline-flex items-center space-x-1.5 text-xs font-mono font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Test Download Current PDF</span>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <FileUploadInput
                name="photoUrl"
                value={photoUrl}
                onChange={(val) => setPhotoUrl(val)}
                accept="image/*"
                placeholder="/uploads/cv_photo.jpg"
                label="Candidate Passport Photo (Shown on CV Top Right)"
                helpText="Official photo displayed on the top-right corner of the printed and on-screen CV."
              />
              {photoUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-14 rounded border border-slate-400 overflow-hidden bg-slate-900 shrink-0">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-slate-400 text-[11px]">Photo preview for printable CV</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Personal Profile & Target Title */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
            <User className="w-4 h-4 text-purple-400" />
            <span>Candidate Header &amp; Headline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Candidate Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialProfile?.name || "MD TANVIR KHAN"}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                defaultValue={initialProfile?.headline || "Network & VoIP Engineer"}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Executive Profile Summary (ATS Intro)
            </label>
            <textarea
              name="bio"
              defaultValue={
                initialProfile?.bio ||
                "Network & VoIP Engineer with hands-on experience in Grandstream IP PBX, FXO/FXS gateways, IVR design & IP telephony deployment. Experienced in managing LAN/WAN infrastructure, configuring network devices & troubleshooting real-world voice and data issues to maintain high system uptime. Strong in security hardening and project-based network rollouts."
              }
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Contact Details on Resume Header */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Resume Contact Coordinates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Location / Address
              </label>
              <input
                type="text"
                name="location"
                defaultValue={currentLocation}
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={currentPhone}
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Professional Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={initialProfile?.email || "mdtanvirkhan.nt@gmail.com"}
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                LinkedIn Profile URL / Handle
              </label>
              <input
                type="text"
                name="linkedin"
                defaultValue={currentLinkedin}
                className="w-full px-3 py-2 rounded-xl bg-[#0e0e34] border border-purple-500/20 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Technical & Soft Skills Summary (Customizable) */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Technical &amp; Soft Skills Summary ({skillsList.length} items)</span>
            </div>
            <button
              type="button"
              onClick={() => setSkillsList([...skillsList, { category: "New Category", details: "Skill 1, Skill 2" }])}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center space-x-1 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill Category</span>
            </button>
          </div>

          <div className="space-y-3">
            {skillsList.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => {
                    const next = [...skillsList];
                    next[idx].category = e.target.value;
                    setSkillsList(next);
                  }}
                  placeholder="Category Name"
                  className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-cyan-300 font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={item.details}
                  onChange={(e) => {
                    const next = [...skillsList];
                    next[idx].details = e.target.value;
                    setSkillsList(next);
                  }}
                  placeholder="Skills (e.g. Routing & Switching, TCP/IP, ...)"
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Professional Training (Customizable) */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Professional Training ({trainingList.length} items)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setTrainingList([
                  ...trainingList,
                  {
                    title: "Training Programme Name",
                    duration: "(Date range)",
                    description: "Details of training...",
                  },
                ])
              }
              className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center space-x-1 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Training</span>
            </button>
          </div>

          <div className="space-y-4">
            {trainingList.map((t, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0e0e34] border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => {
                      const next = [...trainingList];
                      next[idx].title = e.target.value;
                      setTrainingList(next);
                    }}
                    placeholder="Programme Title & Role"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-white font-bold focus:outline-none"
                  />
                  <input
                    type="text"
                    value={t.duration}
                    onChange={(e) => {
                      const next = [...trainingList];
                      next[idx].duration = e.target.value;
                      setTrainingList(next);
                    }}
                    placeholder="(e.g. 6 June 2023 – 25 October 2023)"
                    className="w-64 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setTrainingList(trainingList.filter((_, i) => i !== idx))}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={t.description}
                  onChange={(e) => {
                    const next = [...trainingList];
                    next[idx].description = e.target.value;
                    setTrainingList(next);
                  }}
                  placeholder="Training description and highlights..."
                  className="w-full px-3 py-2 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Education (Customizable) */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Education &amp; Academic Qualifications ({educationList.length} items)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setEducationList([
                  ...educationList,
                  {
                    degree: "Degree Title",
                    institution: "College / University Name",
                    period: "(Year - Year)",
                  },
                ])
              }
              className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center space-x-1 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-3">
            {educationList.map((ed, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0e0e34] border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={ed.degree}
                  onChange={(e) => {
                    const next = [...educationList];
                    next[idx].degree = e.target.value;
                    setEducationList(next);
                  }}
                  placeholder="Degree Title"
                  className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-white font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={ed.institution}
                  onChange={(e) => {
                    const next = [...educationList];
                    next[idx].institution = e.target.value;
                    setEducationList(next);
                  }}
                  placeholder="Institution / Board"
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={ed.period}
                  onChange={(e) => {
                    const next = [...educationList];
                    next[idx].period = e.target.value;
                    setEducationList(next);
                  }}
                  placeholder="(e.g. March 2024 – Present)"
                  className="w-full sm:w-48 px-3 py-1.5 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-400 focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Professional References (Customizable) */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white font-heading">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Professional References ({referencesList.length} items)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setReferencesList([
                  ...referencesList,
                  {
                    name: "Referee Name",
                    title: "Position / Designation",
                    organization: "Organization",
                    phone: "01XXXXXXXXX",
                    email: "ref@example.com",
                  },
                ])
              }
              className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center space-x-1 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reference</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referencesList.map((ref, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0e0e34] border border-purple-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={ref.name}
                    onChange={(e) => {
                      const next = [...referencesList];
                      next[idx].name = e.target.value;
                      setReferencesList(next);
                    }}
                    placeholder="Full Name"
                    className="flex-1 px-3 py-1 rounded-lg bg-[#141444] border border-purple-500/30 text-white font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setReferencesList(referencesList.filter((_, i) => i !== idx))}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ref.title}
                    onChange={(e) => {
                      const next = [...referencesList];
                      next[idx].title = e.target.value;
                      setReferencesList(next);
                    }}
                    placeholder="Title (e.g. Consultant)"
                    className="px-3 py-1 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={ref.organization}
                    onChange={(e) => {
                      const next = [...referencesList];
                      next[idx].organization = e.target.value;
                      setReferencesList(next);
                    }}
                    placeholder="Organization"
                    className="px-3 py-1 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ref.phone}
                    onChange={(e) => {
                      const next = [...referencesList];
                      next[idx].phone = e.target.value;
                      setReferencesList(next);
                    }}
                    placeholder="Phone"
                    className="px-3 py-1 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={ref.email}
                    onChange={(e) => {
                      const next = [...referencesList];
                      next[idx].email = e.target.value;
                      setReferencesList(next);
                    }}
                    placeholder="Email"
                    className="px-3 py-1 rounded-lg bg-[#141444] border border-purple-500/30 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Quick Links to Work Experience & Certifications Console */}
        <div className="p-6 rounded-3xl bg-[#141444]/70 border border-purple-500/20 shadow-xl space-y-3">
          <div className="text-sm font-bold text-white font-heading">
            Work Experience &amp; Certifications Database Link
          </div>
          <p className="text-slate-400">
            Work experience roles and certifications sync dynamically with your dedicated CMS managers. You can manage or add new roles anytime:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/admin/experience"
              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white font-bold transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Work Experience ({experiences.length})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/admin/certifications"
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold transition-all flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Manage Certifications ({certifications.length})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold transition-all flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-purple-500/25 cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving All CV Settings..." : "Save All Resume Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
