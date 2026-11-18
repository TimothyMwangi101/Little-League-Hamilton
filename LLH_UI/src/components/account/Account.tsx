import type { Account, AccountUpdates, TeamMembership } from "./AccountPage"
import ProfileSection from "./ProfileSection"
import SportsSection from "./SportsSection"
import StatsSection from "./StatsSection"
import TeamsSection from "./TeamsSection"

type AccountViewProps = {
    account: Account["AccountsTable"]
    email: Account["email"]
    isSaving: boolean
    onSave: (updates: AccountUpdates) => Promise<boolean>
    saveError: string
    teams: Account["teams"]
    onTeamCreated: (team: TeamMembership) => void
}

export default function AccountView({
    account,
    email,
    teams,
    isSaving,
    onSave,
    saveError,
    onTeamCreated,
}: AccountViewProps) {
    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
            {saveError && (
                <p role="alert" className="mb-5 border-2 border-accent bg-surface p-3 font-bold text-accent">
                    {saveError}
                </p>
            )}

            <ProfileSection account={account} email={email} isSaving={isSaving} onSave={onSave} />
            <StatsSection teams={teams} />
            <div className="grid gap-8 lg:grid-cols-2">
                <SportsSection account={account} isSaving={isSaving} onSave={onSave} />
                <TeamsSection
                    teams={teams}
                    onTeamCreated={onTeamCreated}
                />
            </div>
        </main>
    )
}
