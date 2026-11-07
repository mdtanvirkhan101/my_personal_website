import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import { ResumeViewerControls } from "@/components/website/resume-viewer-controls";
import Link from "next/link";
import {
  FileText,
  Download,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Award,
  ArrowUpRight,
  Printer,
  Sparkles,
  BookOpen,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Curriculum Vitae | MD Tanvir Khan",
  description:
    "Official Curriculum Vitae of MD Tanvir Khan – Network & VoIP Engineer.",
};

export default async function ResumePage() {
  const [profile, settings, dbExperiences, dbCerts] = await Promise.all([
    (await prisma.profile.findFirst({ where: { id: "default-owner-profile" } })) ||
    (await prisma.profile.findFirst()),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "resume_pdf_url",
            "resume_photo_url",
            "contact_phone",
            "resume_location",
            "resume_linkedin",
            "resume_skills_custom",
            "resume_training_custom",
            "resume_education_custom",
            "resume_references_custom",
          ],
        },
      },
    }),
    prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const name = profile?.name || "MD TANVIR KHAN";
  const headline = profile?.headline || "Network & VoIP Engineer";
  const bio =
    profile?.bio ||
    "Network & VoIP Engineer with hands-on experience in Grandstream IP PBX, FXO/FXS gateways, IVR design & IP telephony deployment. Experienced in managing LAN/WAN infrastructure, configuring network devices & troubleshooting real-world voice and data issues to maintain high system uptime. Strong in security hardening and project-based network rollouts, with a continuous focus on learning new technologies.";
  const location = settingsMap["resume_location"] || profile?.location || "Kuril, Bhatara, Dhaka-1229, Bangladesh";
  const email = profile?.email || "mdtanvirkhan.nt@gmail.com";
  const phone = settingsMap["contact_phone"] || "+8801601501775";
  const linkedin = settingsMap["resume_linkedin"] || "https://linkedin.com/in/mdtanvirkhan101/";
  const photoUrl = settingsMap["resume_photo_url"] || profile?.avatarUrl || "/uploads/cv_photo_extracted.jpg";

  const resumeDownloadUrl =
    profile?.resumeUrl ||
    settingsMap["resume_pdf_url"] ||
    "/uploads/1793964968919-CV_of_MD_Tanvir_Khan.pdf";

  // Dynamic or default skills
  const skillsList = Array.isArray(settingsMap["resume_skills_custom"]) && settingsMap["resume_skills_custom"].length > 0
    ? settingsMap["resume_skills_custom"]
    : [
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

  // Dynamic or default training
  const trainingList = Array.isArray(settingsMap["resume_training_custom"]) && settingsMap["resume_training_custom"].length > 0
    ? settingsMap["resume_training_custom"]
    : [
      {
        title: "1. ISDB-BISEW IT Scholarship Programme — Network Systems Administrator",
        duration: "(6 June 2023 – 25 October 2023)",
        description:
          "I completed a training programme on computer systems and networking basics. I learned how to install, set up & manage Windows Server and virtual machines. I also learned how to make a system more secure, manage user access and find security threats. I studied the basic ideas of ethical hacking as well. Besides that, I worked with MikroTik to configure network devices, set up basic routing & manage bandwidth. I also completed CCNA Basic with hands-on lab practice.",
      },
    ];

  // Dynamic or default education
  const educationList = Array.isArray(settingsMap["resume_education_custom"]) && settingsMap["resume_education_custom"].length > 0
    ? settingsMap["resume_education_custom"]
    : [
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

  // Dynamic or default references
  const referencesList = Array.isArray(settingsMap["resume_references_custom"]) && settingsMap["resume_references_custom"].length > 0
    ? settingsMap["resume_references_custom"]
    : [
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

  const formatExpDate = (date: Date | null, isCurrent?: boolean) => {
    if (isCurrent || !date) return "Present";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0e34] text-slate-300 relative selection:bg-purple-500/40 selection:text-white flex flex-col font-sans overflow-x-hidden print:bg-white print:text-black">
      {/* Hide on print */}
      <div className="print:hidden">
        <PremiumBackground />
        <Navbar />
      </div>

      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 relative z-10 space-y-8 print:p-0 print:m-0 print:max-w-none print:w-full">

        {/* Top Controls Toolbar (Interactive CV View & Direct Print) */}
        <ResumeViewerControls
          resumeDownloadUrl={resumeDownloadUrl}
          candidateData={{
            name,
            headline,
            bio,
            location,
            phone,
            email,
            linkedin,
            photoUrl,
            skillsList,
            trainingList,
            educationList,
            referencesList,
            experiences: dbExperiences,
            certifications: dbCerts,
          }}
        />

        {/* Printable & Pixel-Perfect CV Sheet Matching the Official PDF */}
        <div
          id="cv-printable-sheet"
          className="max-w-4xl mx-auto bg-white text-[#111827] rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:p-0 font-sans leading-normal selection:bg-blue-100 selection:text-black"
        >
          {/* HEADER: Left (Name, Location, Contact), Right (Photo) */}
          <header className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-4 border-b border-slate-300">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0f172a] font-sans">
                {name}
              </h1>
              <div className="text-xs sm:text-[13px] text-[#334155] leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1 font-normal">
                <span>{location}</span>
                <span className="text-slate-400 font-bold">|</span>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline text-[#0f172a] font-medium">
                  {phone}
                </a>
                <span className="text-slate-400 font-bold">|</span>
                <a href={`mailto:${email}`} className="hover:underline text-[#0f172a] font-medium">
                  {email}
                </a>
                <span className="text-slate-400 font-bold">|</span>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-700 font-medium"
                >
                  {linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            </div>

            {/* Passport Photo */}
            <div className="shrink-0 self-center sm:self-start">
              <div className="w-24 h-28 sm:w-28 sm:h-32 border-2 border-slate-300 rounded-md overflow-hidden bg-slate-100 shadow-sm">
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-6 text-[13px] text-[#1f2937] leading-relaxed">

            {/* 1. PROFESSIONAL SUMMARY */}
            <section className="space-y-1.5 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-justify leading-relaxed text-[#334155] pt-0.5 font-normal">
                {bio}
              </p>
            </section>

            {/* 2. TECHNICAL & SOFT SKILLS SUMMARY */}
            <section className="space-y-1.5 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                TECHNICAL &amp; SOFT SKILLS SUMMARY
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-[#334155] pt-0.5">
                {skillsList.map((sk: any, idx: number) => (
                  <li key={idx}>
                    <strong className="text-[#0f172a]">{sk.category}:</strong> {sk.details}
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. KEY CERTIFICATIONS */}
            <section className="space-y-2 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                KEY CERTIFICATIONS
              </h2>
              <div className="space-y-1.5 text-[#334155] pt-0.5">
                {dbCerts && dbCerts.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {dbCerts.map((cert) => (
                      <li key={cert.id}>
                        <strong className="text-[#0f172a]">{cert.name}</strong> - [{cert.issuer}]
                        {cert.credentialUrl && ` (${cert.credentialUrl.replace(/^https?:\/\//, "")})`}
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
            </section>

            {/* 4. PROFESSIONAL EXPERIENCE */}
            <section className="space-y-3 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                PROFESSIONAL EXPERIENCE
              </h2>

              {dbExperiences && dbExperiences.length > 0 ? (
                <div className="space-y-3">
                  {dbExperiences.map((exp, idx) => (
                    <div key={exp.id} className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                        <span>{idx + 1}. {exp.organization} — {exp.role}</span>
                        <span className="font-semibold text-xs text-[#475569]">
                          ({formatExpDate(exp.startDate)} – {formatExpDate(exp.endDate, exp.current)})
                        </span>
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
                  {/* Fallback default experiences */}
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
            </section>

            {/* 5. PROFESSIONAL TRAINING */}
            <section className="space-y-1.5 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                PROFESSIONAL TRAINING
              </h2>
              <div className="space-y-2 pt-0.5">
                {trainingList.map((t: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-[#0f172a]">
                      <span>{t.title}</span>
                      <span className="font-semibold text-xs text-[#475569]">{t.duration}</span>
                    </div>
                    <p className="text-justify text-[#334155] leading-relaxed font-normal">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. EDUCATION */}
            <section className="space-y-2 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                EDUCATION
              </h2>
              <div className="space-y-1.5 text-[#334155] pt-0.5">
                {educationList.map((ed: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <strong className="text-[#0f172a]">{ed.degree}</strong>
                      <div className="text-xs text-[#475569]">{ed.institution}</div>
                    </div>
                    <span className="text-xs font-semibold text-[#475569]">{ed.period}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. REFERENCES */}
            <section className="space-y-2 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-slate-300 pb-0.5">
                REFERENCES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-0.5 text-xs text-[#334155]">
                {referencesList.map((ref: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-sm text-[#0f172a]">{ref.name}</div>
                    <div className="text-[#475569]">{ref.title}</div>
                    <div className="text-[#475569]">{ref.organization}</div>
                    <div>
                      <span>Phone: </span>
                      <a href={`tel:${ref.phone.replace(/\s+/g, "")}`} className="text-[#0f172a] font-medium hover:underline">
                        {ref.phone}
                      </a>
                    </div>
                    <div>
                      <span>Email: </span>
                      <a href={`mailto:${ref.email}`} className="text-[#0f172a] font-medium hover:underline">
                        {ref.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Bottom CTA on Resume Page */}
        <div className="print:hidden rounded-3xl border border-purple-500/30 p-8 sm:p-10 bg-gradient-to-r from-[#141444] via-[#1a1a52] to-[#141444] text-center space-y-4 shadow-xl">
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Interested in collaborating or discussing an infrastructure project?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-normal">
            Whether it&apos;s a dedicated engineering position or contract VoIP network design, my channels are open.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Get in Touch Directly</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 rounded-2xl bg-[#0e0e34] hover:bg-slate-800 border border-purple-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Explore My Services</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
