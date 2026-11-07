import { getHeaderFooterConfig } from "@/actions/header-footer";
import { FooterClient } from "./footer-client";

export async function Footer() {
  const config = await getHeaderFooterConfig();

  return <FooterClient config={config} />;
}