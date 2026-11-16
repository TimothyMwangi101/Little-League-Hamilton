import { useEffect, useState } from "react"
import { Link } from "react-router"
import type { Account } from "./AccountPage"
import Button, { actionButtonClass } from "../shared/Button"
import TeamForm from "../team/TeamForm";
import client from '../../client';
import type { Team } from "@shared/types";

type TeamsSectionProps = {
    account: Account["AccountsTable"]
    onTeamCreated: (team: Team) => void
}

export default function TeamsSection({ account, onTeamCreated }: TeamsSectionProps) {
    const [isCreatingForm, setIsCreatingForm] = useState(false)
    const [team, setTeam] = useState<Team | undefined>(undefined);
    const [teamLoadError, setTeamLoadError] = useState("")

    function handleTeamCreated(createdTeam: Team) {
        setTeam(createdTeam)
        onTeamCreated(createdTeam)
    }

    useEffect(() => {
        if (!account.team || team?.id === account.team) return

        let isCurrent = true

        async function loadTeam() {
            try {
                const response = await client.team.$get()
                const result = await response.json()

                if ("error" in result) throw new Error(String(result.error))

                if (!result.data) throw new Error("Your team could not be found.")

                if (isCurrent) {
                    setTeam(result.data)
                    setTeamLoadError("")
                }
            } catch (error) {
                console.error(error)
                if (isCurrent) {
                    setTeam(undefined)
                    setTeamLoadError("Unable to load your team. Please try again.")
                }
            }
        }

        void loadTeam()
        return () => {
            isCurrent = false
        }
    }, [account.team, team?.id])

    return (
        <section aria-labelledby="teams-heading" className="border-2 border-text-main bg-surface shadow-hard">
            <div className="border-b-2 border-text-main bg-background-light p-5">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="teams-heading">
                    My Team
                </h2>
            </div>
            <div className="flex flex-col gap-5 p-5">
                <div>
                    <p className="border-2 border-text-main bg-primary px-4 py-2 font-bold uppercase tracking-wide text-white inline">
                        {account.team
                            ? team?.id === account.team
                                ? team.name
                                : teamLoadError || "Loading your team..."
                            : "You are not on a team yet."}
                    </p>
                    {!account.team && (
                        <p className="mt-1 text-sm text-muted">
                            Create a team and recruit players, or browse existing teams to join an open roster.
                        </p>
                    )}
                </div>
                {teamLoadError && (
                    <p role="alert" className="border-2 border-accent bg-surface p-3 font-bold text-accent">
                        {teamLoadError}
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
