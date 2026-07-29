import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { TeamManagement } from "@/components/settings/team-management";
import { getCurrentUser, getSettings, getTeamMembers } from "@/lib/api-server";

export default async function SettingsPage() {
  const [currentUser, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const isAdmin = currentUser?.role === "ADMIN";
  const members = isAdmin ? await getTeamMembers() : [];

  return (
    <AppShell title="Paramètres" subtitle="Profil, services et scoring (partagés par toute l'équipe)">
      <div className="space-y-6">
        <SettingsForm initialSettings={settings} />
        {isAdmin ? <TeamManagement members={members} /> : null}
      </div>
    </AppShell>
  );
}
