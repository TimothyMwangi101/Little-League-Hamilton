import type { Account, AccountUpdates, CreateTeamRequest } from "./AccountPage"
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
    onCreateTeam: (team: CreateTeamRequest) => Promise<boolean>
    isCreatingTeam: boolean
    createTeamError: string
}

export default function AccountView({
    account,
    email,
    isSaving,
    onSave,
    saveError,
    onCreateTeam,
    isCreatingTeam,
    createTeamError,
}: AccountViewProps) {
    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
            {saveError && (
                <p role="alert" className="mb-5 border-2 border-accent bg-surface p-3 font-bold text-accent">
                    {saveError}
                </p>
            )}

            <ProfileSection account={account} email={email} isSaving={isSaving} onSave={onSave} />
            <StatsSection account={account} />
            <div className="grid gap-8 lg:grid-cols-2">
                <SportsSection account={account} isSaving={isSaving} onSave={onSave} />
                <TeamsSection
                    account={account}
                    onCreateTeam={onCreateTeam}
                    isCreatingTeam={isCreatingTeam}
                    createTeamError={createTeamError}
                />
            </div>
        </main>
    )
}
