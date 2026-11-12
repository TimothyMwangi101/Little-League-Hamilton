import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createTeamValidator } from "@shared/validators"
import type { Account, CreateTeamRequest } from "./AccountPage"
import Button, { actionButtonClass } from "../shared/Button"

type TeamsSectionProps = {
    account: Account["AccountsTable"]
    onCreateTeam: (team: CreateTeamRequest) => Promise<boolean>
    isCreatingTeam: boolean
    createTeamError: string
}

type CreateTeamFormValues = z.input<typeof createTeamValidator>

export default function TeamsSection({
    account,
    onCreateTeam,
    isCreatingTeam,
    createTeamError,
}: TeamsSectionProps) {
    const [isCreatingForm, setIsCreatingForm] = useState(false)
    const [teamCreated, setTeamCreated] = useState(false)
    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamValidator),
        defaultValues: { name: "", invitePolicy: "Open" },
    })
    const isBusy = isCreatingTeam || isSubmitting

    async function createTeam(values: CreateTeamFormValues) {
        if (await onCreateTeam(values)) {
            reset({ name: "", invitePolicy: "Open" })
            setIsCreatingForm(false)
            setTeamCreated(true)
        }
    }

    return (
        <section aria-labelledby="teams-heading" className="border-2 border-text-main bg-surface shadow-hard">
            <div className="border-b-2 border-text-main bg-background-light p-5">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="teams-heading">
                    My Teams
                </h2>
            </div>
            <div className="flex flex-col gap-5 p-5">
                <div>
                    <p className="font-bold text-text-main">
                        {account.team ? `You are a member of team #${account.team}.` : "You are not on a team yet."}
                    </p>
                    {!account.team && (
                        <p className="mt-1 text-sm text-muted">
                            Create a team and recruit players, or browse existing teams to join an open roster.
                        </p>
                    )}
                </div>
                {teamCreated && (
                    <p role="status" className="border-2 border-primary bg-surface p-3 font-bold text-primary">
                        Team created successfully.
                    </p>
                )}
                {createTeamError && (
                    <p role="alert" className="border-2 border-accent bg-surface p-3 font-bold text-accent">
                        {createTeamError}
                    </p>
                )}
                {isCreatingForm ? (
                    <form className="grid gap-3 border-t-2 border-text-main/10 pt-4" onSubmit={handleSubmit(createTeam)}>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" disabled={isBusy} type="submit">
                                <span aria-hidden="true" className="material-symbols-outlined mr-1 align-middle text-base">group_add</span>
                                {isBusy ? "Creating..." : "Create team"}

                            </Button>
                            <Button
                                disabled={isBusy}
                                onClick={() => {
                                    reset({ name: "", invitePolicy: "Open" })
                                    setIsCreatingForm(false)
                                }}
                                type="button"
                                variant="action">
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col gap-3 border-t-2 border-text-main/10 pt-4 sm:flex-row">
                        <Button
                            disabled={isBusy}
                            onClick={() => {
                                setTeamCreated(false)
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
                )}
            </div>
        </section>
    )
}
