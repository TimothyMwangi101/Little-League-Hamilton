import { useEffect, useState } from "react"
import { Link } from "react-router"
import type { Account, CreateTeamRequest } from "./AccountPage"
import Button, { actionButtonClass } from "../shared/Button"
import TeamForm from "../team/TeamForm";
import client from '../../client';
import type { InferResponseType } from "hono";
import type { StatusCodes } from "http-status-codes";

type Team = InferResponseType<typeof client.team.$get, StatusCodes.OK>["data"][number];

type TeamsSectionProps = {
    account: Account["AccountsTable"]
    onCreateTeam: (team: CreateTeamRequest) => Promise<boolean>
    isCreatingTeam: boolean
    createTeamError: string
}

export default function TeamsSection({ account, onCreateTeam, isCreatingTeam,
    createTeamError }: TeamsSectionProps) {
    const [isCreatingForm, setIsCreatingForm] = useState(false)
    const isBusy = isCreatingTeam
    const [team, setTeam] = useState<Team | undefined>(undefined);
    const [teamLoadError, setTeamLoadError] = useState("")

    async function createTeam(values: CreateTeamRequest) {
        return onCreateTeam(values)
    }

    useEffect(() => {
        if (!account.team) return

        let isCurrent = true

        async function loadTeam() {
            try {
                const response = await client.team.$get()
                const result = await response.json()

                if ("error" in result) throw new Error(String(result.error))

                const accountTeam = result.data.find(({ id }) => id === account.team)
                if (!accountTeam) throw new Error("Your team could not be found.")

                if (isCurrent) {
                    setTeam(accountTeam)
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
    }, [account.team])

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
                {createTeamError && !isCreatingForm && (
                    <p role="alert" className="border-2 border-accent bg-surface p-3 font-bold text-accent">
                        {createTeamError}
                    </p>
                )}
                <div className="flex flex-col gap-3 border-t-2 border-text-main/10 pt-4 sm:flex-row">
                    <Button
                        disabled={isBusy}
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
                    createTeamError={createTeamError}
                    isCreatingTeam={isBusy}
                    onClose={() => setIsCreatingForm(false)}
                    onCreateTeam={createTeam}
                />
            )}
        </section>
    )
}
