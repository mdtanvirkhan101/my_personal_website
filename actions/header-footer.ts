"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  HeaderFooterConfig,
  defaultHeaderFooterConfig,
} from "@/lib/header-footer-config";

/**
 * Get current Header and Footer settings from Database
 */
export async function getHeaderFooterConfig(): Promise<HeaderFooterConfig> {
  try {
    const [settings, profile] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.profile.findFirst({ where: { id: "default-owner-profile" } }).then((p) => p || prisma.profile.findFirst()),
    ]);

    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    const profileSocials = (profile?.socialLinks as any) || {};

    return {
      // Header
      headerSiteTitle:
        map["site_title"] || profile?.name || defaultHeaderFooterConfig.headerSiteTitle,
      headerSiteTagline:
        map["site_tagline"] || profile?.headline || defaultHeaderFooterConfig.headerSiteTagline,
      headerSiteLogo: map["site_logo"] || defaultHeaderFooterConfig.headerSiteLogo,
      headerCta1Text: map["header_cta1_text"] || defaultHeaderFooterConfig.headerCta1Text,
      headerCta1Url: map["header_cta1_url"] || defaultHeaderFooterConfig.headerCta1Url,
      headerShowCta1:
        map["header_show_cta1"] !== undefined
          ? map["header_show_cta1"]
          : defaultHeaderFooterConfig.headerShowCta1,
      headerCta2Text: map["header_cta2_text"] || defaultHeaderFooterConfig.headerCta2Text,
      headerCta2Url: map["header_cta2_url"] || defaultHeaderFooterConfig.headerCta2Url,
      headerShowCta2:
        map["header_show_cta2"] !== undefined
          ? map["header_show_cta2"]
          : defaultHeaderFooterConfig.headerShowCta2,

      // Footer
      footerBrandTitle:
        map["footer_brand_title"] ||
        map["site_title"] ||
        profile?.name ||
        defaultHeaderFooterConfig.footerBrandTitle,
      footerBrandTagline:
        map["footer_brand_tagline"] ||
        map["site_tagline"] ||
        profile?.headline ||
        defaultHeaderFooterConfig.footerBrandTagline,
      footerBrandLogo:
        map["footer_brand_logo"] !== undefined && map["footer_brand_logo"] !== ""
          ? map["footer_brand_logo"]
          : map["site_logo"] || defaultHeaderFooterConfig.footerBrandLogo,
      footerShowLogo:
        map["footer_show_logo"] !== undefined
          ? map["footer_show_logo"]
          : defaultHeaderFooterConfig.footerShowLogo,
      footerAboutTitle:
        map["footer_about_title"] || defaultHeaderFooterConfig.footerAboutTitle,
      footerAboutText:
        map["footer_about_text"] ||
        profile?.bio ||
        defaultHeaderFooterConfig.footerAboutText,
      footerContactPhone:
        map["contact_phone"] ||
        profileSocials.phone ||
        defaultHeaderFooterConfig.footerContactPhone,
      footerContactEmail:
        map["contact_email"] ||
        profile?.email ||
        defaultHeaderFooterConfig.footerContactEmail,
      footerLocation:
        map["contact_location"] ||
        profile?.location ||
        defaultHeaderFooterConfig.footerLocation,

      // Newsletter
      footerShowNewsletter:
        map["footer_show_newsletter"] !== undefined
          ? map["footer_show_newsletter"]
          : defaultHeaderFooterConfig.footerShowNewsletter,
      footerNewsletterTitle:
        map["footer_newsletter_title"] || defaultHeaderFooterConfig.footerNewsletterTitle,
      footerNewsletterPlaceholder:
        map["footer_newsletter_placeholder"] ||
        defaultHeaderFooterConfig.footerNewsletterPlaceholder,
      footerNewsletterBtnText:
        map["footer_newsletter_btn_text"] ||
        defaultHeaderFooterConfig.footerNewsletterBtnText,

      // Copyright & Socials
      footerCopyrightText:
        map["footer_copyright"] || defaultHeaderFooterConfig.footerCopyrightText,
      footerShowSocials:
        map["footer_show_socials"] !== undefined
          ? map["footer_show_socials"]
          : defaultHeaderFooterConfig.footerShowSocials,
      footerShowScrollTop:
        map["footer_show_scroll_top"] !== undefined
          ? map["footer_show_scroll_top"]
          : defaultHeaderFooterConfig.footerShowScrollTop,

      footerFacebookUrl:
        map["facebook_url"] ||
        profileSocials.facebook ||
        defaultHeaderFooterConfig.footerFacebookUrl,
      footerGithubUrl:
        map["github_url"] ||
        profileSocials.github ||
        defaultHeaderFooterConfig.footerGithubUrl,
      footerTwitterUrl:
        map["twitter_url"] ||
        profileSocials.twitter ||
        defaultHeaderFooterConfig.footerTwitterUrl,
      footerLinkedinUrl:
        map["linkedin_url"] ||
        profileSocials.linkedin ||
        defaultHeaderFooterConfig.footerLinkedinUrl,
      footerSocialProfiles:
        Array.isArray(map["footer_social_profiles"]) && map["footer_social_profiles"].length > 0
          ? map["footer_social_profiles"]
          : defaultHeaderFooterConfig.footerSocialProfiles,

      footerCol2Title:
        map["footer_col2_title"] || defaultHeaderFooterConfig.footerCol2Title,
      footerCol2Links:
        map["footer_col2_links"] || defaultHeaderFooterConfig.footerCol2Links,
      footerCol3Title:
        map["footer_col3_title"] || defaultHeaderFooterConfig.footerCol3Title,
      footerCol3Links:
        map["footer_col3_links"] || defaultHeaderFooterConfig.footerCol3Links,
    };
  } catch (error) {
    console.error("Error fetching header & footer settings:", error);
    return defaultHeaderFooterConfig;
  }
}

/**
 * Save Header and Footer settings to Database and revalidate caches
 */
export async function saveHeaderFooterConfig(
  newConfig: Partial<HeaderFooterConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const current = await getHeaderFooterConfig();
    const merged = { ...current, ...newConfig };

    const batchEntries: Array<{ key: string; value: any }> = [
      // Header
      { key: "site_title", value: merged.headerSiteTitle },
      { key: "site_tagline", value: merged.headerSiteTagline },
      { key: "site_logo", value: merged.headerSiteLogo },
      { key: "header_cta1_text", value: merged.headerCta1Text },
      { key: "header_cta1_url", value: merged.headerCta1Url },
      { key: "header_show_cta1", value: merged.headerShowCta1 },
      { key: "header_cta2_text", value: merged.headerCta2Text },
      { key: "header_cta2_url", value: merged.headerCta2Url },
      { key: "header_show_cta2", value: merged.headerShowCta2 },

      // Footer
      { key: "footer_brand_title", value: merged.footerBrandTitle },
      { key: "footer_brand_tagline", value: merged.footerBrandTagline },
      { key: "footer_brand_logo", value: merged.footerBrandLogo },
      { key: "footer_show_logo", value: merged.footerShowLogo },
      { key: "footer_about_title", value: merged.footerAboutTitle },
      { key: "footer_about_text", value: merged.footerAboutText },
      { key: "contact_phone", value: merged.footerContactPhone },
      { key: "contact_email", value: merged.footerContactEmail },
      { key: "contact_location", value: merged.footerLocation },

      // Newsletter
      { key: "footer_show_newsletter", value: merged.footerShowNewsletter },
      { key: "footer_newsletter_title", value: merged.footerNewsletterTitle },
      { key: "footer_newsletter_placeholder", value: merged.footerNewsletterPlaceholder },
      { key: "footer_newsletter_btn_text", value: merged.footerNewsletterBtnText },

      // Copyright & Navigation
      { key: "footer_copyright", value: merged.footerCopyrightText },
      { key: "footer_show_socials", value: merged.footerShowSocials },
      { key: "footer_show_scroll_top", value: merged.footerShowScrollTop },
      { key: "facebook_url", value: merged.footerFacebookUrl },
      { key: "github_url", value: merged.footerGithubUrl },
      { key: "twitter_url", value: merged.footerTwitterUrl },
      { key: "linkedin_url", value: merged.footerLinkedinUrl },
      { key: "footer_social_profiles", value: merged.footerSocialProfiles },

      { key: "footer_col2_title", value: merged.footerCol2Title },
      { key: "footer_col2_links", value: merged.footerCol2Links },
      { key: "footer_col3_title", value: merged.footerCol3Title },
      { key: "footer_col3_links", value: merged.footerCol3Links },
    ];

    for (const item of batchEntries) {
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    // Revalidate public layouts and pages
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/header-footer");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save header footer config:", err);
    return { success: false, error: err.message || "Failed to save settings" };
  }
}

/**
 * Reset Header & Footer settings to defaults
 */
export async function resetHeaderFooterConfig(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    return await saveHeaderFooterConfig(defaultHeaderFooterConfig);
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset" };
  }
}
