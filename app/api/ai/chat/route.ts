import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const trimmed = message.trim();

    // Fetch Profile, Skills, Services, and AI config from database
    const [profile, skills, services, aiSetting] = await Promise.all([
      (await prisma.profile.findFirst({ where: { id: "default-owner-profile" } })) || (await prisma.profile.findFirst()),
      prisma.skill.findMany({ take: 10, orderBy: { level: "desc" } }),
      prisma.service.findMany({ where: { active: true }, take: 5 }),
      prisma.siteSetting.findUnique({ where: { key: "ai_integration_config" } }),
    ]);

    const name = profile?.name || "MD Tanvir Khan";
    const headline = profile?.headline || "Full-Stack Software Engineer & AI Systems Architect";
    const bio = profile?.bio || "Expert in Next.js, TypeScript, PostgreSQL, and scalable architectures.";
    const skillList = skills.map((s) => s.name).join(", ") || "Next.js, React, Node.js, TypeScript, PostgreSQL, Docker, AWS, AI Integration";
    const serviceList = services.map((s) => s.title).join(", ");

    const aiConfig = (aiSetting?.value as any) || {};

    // 1. If OpenAI API Key is configured
    if (aiConfig.provider === "OPENAI" && aiConfig.apiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${aiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: aiConfig.model || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are the personal AI Assistant for ${name}.
Headline: ${headline}
Bio: ${bio}
Top Skills: ${skillList}
Services: ${serviceList}
Tone: Polite, technical, professional, concise (2-4 sentences max).
Always encourage serious inquiries to reach out via WhatsApp, Email, or the Contact form.`,
              },
              { role: "user", content: trimmed },
            ],
            temperature: 0.7,
            max_tokens: 250,
          }),
        });

        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ reply: data.choices[0].message.content });
        }
      } catch (err) {
        console.error("OpenAI API call failed, falling back to local reasoning:", err);
      }
    }

    // 2. If Google Gemini API Key is configured
    if (aiConfig.provider === "GEMINI" && aiConfig.apiKey) {
      try {
        const modelName = aiConfig.model || "gemini-1.5-flash";
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${aiConfig.apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the AI portfolio assistant for ${name} (${headline}).
Bio: ${bio}
Skills: ${skillList}
Services: ${serviceList}
User question: "${trimmed}"
Answer concisely, professionally, and enthusiastically in 2-4 sentences. Mention they can hire or talk to Tanvir directly via the Contact form or WhatsApp.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await res.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (res.ok && geminiText) {
          return NextResponse.json({ reply: geminiText });
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local reasoning:", err);
      }
    }

    // 3. Fallback Intelligent Responses (works seamlessly even before entering an API key)
    const lower = trimmed.toLowerCase();
    let reply = `Hello! I am Tanvir's portfolio AI assistant. Tanvir is a ${headline} specializing in modern scalable web architectures. How can I help you today?`;

    if (lower.includes("skill") || lower.includes("tech") || lower.includes("stack")) {
      reply = `Tanvir specializes in ${skillList}. He builds high-performance web applications using clean architectures, microservices, and modern UI frameworks.`;
    } else if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("charge")) {
      reply = `Tanvir offers custom software development starting at $1,500/project, as well as hourly consulting. Services include: ${serviceList || "Full-stack web apps, API architecture, AI integrations"}. You can request an exact quote via the Contact form or WhatsApp!`;
    } else if (lower.includes("hire") || lower.includes("available") || lower.includes("contact") || lower.includes("call")) {
      reply = `Tanvir is currently available for senior engineering roles, high-impact freelance projects, and tech consulting. You can reach him instantly via WhatsApp or the Contact form at the bottom of the page!`;
    } else if (lower.includes("project") || lower.includes("work") || lower.includes("portfolio")) {
      reply = `Tanvir has built over 15+ production applications including AI analytics platforms, scalable e-commerce systems, and real-time dashboards. You can explore them in the Projects section and even download full PDF case studies!`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Chat Route error:", error);
    return NextResponse.json(
      { reply: "Hello! I am currently assisting visitors. Please feel free to send a direct message through the Contact section or WhatsApp." },
      { status: 200 }
    );
  }
}
