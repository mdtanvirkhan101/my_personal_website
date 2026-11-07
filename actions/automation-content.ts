"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { aiManager } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export interface GenerateContentInput {
  contentType: "blog" | "case_study" | "seo" | "translation" | "summary" | "social";
  topicOrContext: string;
  targetAudience?: string;
  tone?: string;
  targetLanguage?: "en" | "bn";
  model?: string;
}

/**
 * Generate AI-assisted content for CMS workflows
 */
export async function generateContentAction(input: GenerateContentInput) {
  try {
    await requireAdmin();

    let systemPrompt = "You are a senior technical writer and marketing strategist for Tanvir Khan's portfolio website.";
    let userPrompt = "";

    switch (input.contentType) {
      case "blog":
        systemPrompt += " Write an engaging, developer-focused technical blog post in markdown format with clear sections, code snippets if relevant, and takeaways.";
        userPrompt = `Write a comprehensive article on: "${input.topicOrContext}". Include: Title suggestions, Introduction, Key Concepts, Practical Implementation, and Conclusion.`;
        break;

      case "case_study":
        systemPrompt += " Structure this as an enterprise project case study with three distinct sections: Problem, Solution, and Measurable Outcome.";
        userPrompt = `Generate a detailed case study breakdown for this project/initiative: "${input.topicOrContext}". Highlight technical complexity, VoIP/networking or full-stack technologies used.`;
        break;

      case "seo":
        systemPrompt += " Output strictly valid JSON with keys: seoTitle (under 60 chars), seoDescription (under 160 chars), keywords (array of 8 relevant tags).";
        userPrompt = `Generate optimized SEO metadata for this content: "${input.topicOrContext}".`;
        break;

      case "translation":
        const targetLang = input.targetLanguage === "bn" ? "Bangla (বাংলা)" : "English";
        systemPrompt += ` Translate the provided content accurately and naturally into ${targetLang}, preserving technical terms.`;
        userPrompt = `Translate the following text:\n\n${input.topicOrContext}`;
        break;

      case "summary":
        systemPrompt += " Provide a crisp 2-3 sentence executive summary followed by 3 key bullet points.";
        userPrompt = `Summarize this text:\n\n${input.topicOrContext}`;
        break;

      case "social":
        systemPrompt += " Write 2 engaging social media captions (LinkedIn and X/Twitter style) with appropriate hashtags.";
        userPrompt = `Write social posts announcing this topic:\n\n${input.topicOrContext}`;
        break;
    }

    const result = await aiManager.generateCompletion(
      {
        purpose: `content_generation:${input.contentType}`,
        model: input.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to generate content." };
    }

    return {
      success: true,
      content: result.content,
      provider: result.provider,
      model: result.model,
      tokens: result.totalTokens,
      estimatedCost: result.estimatedCost,
      durationMs: result.durationMs,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Content generation failed" };
  }
}

