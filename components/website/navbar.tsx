import { getHeaderFooterConfig } from "@/actions/header-footer";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const config = await getHeaderFooterConfig();

  return (
    <NavbarClient
      siteTitle={config.headerSiteTitle}
      siteTagline={config.headerSiteTagline}
      siteLogo={config.headerSiteLogo}
      adminName={config.headerSiteTitle}
      cta1Text={config.headerCta1Text}
      cta1Url={config.headerCta1Url}
      showCta1={config.headerShowCta1}
      cta2Text={config.headerCta2Text}
      cta2Url={config.headerCta2Url}
      showCta2={config.headerShowCta2}
    />
  );
}
