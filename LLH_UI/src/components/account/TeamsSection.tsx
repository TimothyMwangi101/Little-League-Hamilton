import { useState } from "react"
import { Link } from "react-router"
import type { Account, TeamMembership } from "./AccountPage"
import Button, { actionButtonClass } from "../shared/Button"
import TeamForm from "../team/TeamForm";

type TeamsSectionProps = {
    teams: Account["teams"]
    onTeamCreated: (team: TeamMembership) => void
}

export default function TeamsSection({ teams, onTeamCreated }: TeamsSectionProps) {
    const [isCreatingForm, setIsCreatingForm] = useState(false)

    function handleTeamCreated(createdTeam: TeamMembership) {
        onTeamCreated(createdTeam)
    }

    return (
        <section aria-labelledby="teams-heading" className="border-2 border-text-main bg-surface shadow-hard">
            <div className="border-b-2 border-text-main bg-background-light p-5">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="teams-heading">
                    My Teams
                </h2>
            </div>
            <div className="flex flex-col gap-5 p-5">
                {teams.length > 0 ? (
                    <ul className="space-y-3">
                        {teams.map(({ team, role, wins, losses, draws }) => (
                            <li className="border-2 border-text-main bg-off-white p-4" key={team.id}>
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="font-heading text-xl font-bold">{team.name}</h3>
                                    <span className="text-sm font-bold uppercase tracking-wide text-muted">{role}</span>
                                </div>
                                <p className="mt-1 text-sm text-muted">{team.sport}</p>
                                <p className="mt-3 text-sm font-bold">
                                    Record: {wins} wins, {losses} losses, {draws} draws
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">
                        You are not on a team yet. Create a team or browse existing teams to join an open roster.
                    </p>
                )}
                <div className="flex flex-col gap-3 border-t-2 border-text-main/10 pt-4 sm:flex-row">
                    <Button
                        onClick={() => {
                            setIsCreatingForm(true)
                        }}
                        type="button"
                        variant="primary">
                        <span aria-hidden="true" className="material-symbols-outlined mr-1 align-middle text-base">group_add</span>
                        Create a team
                    </Button>
                    <Link className={`${actionButtonClass} justify-center`} to="/search">
                        Browse teams
                    </Link>
                </div>
            </div>
            {isCreatingForm && (
                <TeamForm
                    onClose={() => setIsCreatingForm(false)}
                    onTeamCreated={handleTeamCreated}
                />
            )}
        </section>
    )
}
