import { getAdminSession } from "@/lib/auth";
import { getAutomationOverviewAction } from "@/actions/automation-dashboard";
import { getAIProvidersAction } from "@/actions/automation-ai";
import { getIntegrationsAction } from "@/actions/automation-integrations";
import { getWorkflowsAction } from "@/actions/automation-workflows";
import { AutomationHubManager } from "@/components/admin/automation-hub-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI & Automation Hub | Admin CMS",
  description: "Centralized AI orchestration, event-driven workflows, third-party integrations, and automated tasks.",
};

export default async function AdminAutomationPage() {
  await getAdminSession();

  const [overviewRes, providersRes, integrationsRes, workflowsRes] = await Promise.all([
    getAutomationOverviewAction(),
    getAIProvidersAction(),
    getIntegrationsAction(),
    getWorkflowsAction(),
  ]);

  return (
    <AutomationHubManager
      initialOverview={overviewRes.success ? overviewRes : null}
      initialProviders={providersRes.success ? (providersRes.providers as any) : []}
      initialIntegrations={integrationsRes.success ? (integrationsRes.integrations as any) : []}
      initialWorkflows={workflowsRes.success ? (workflowsRes.workflows as any) : []}
    />
  );
}

