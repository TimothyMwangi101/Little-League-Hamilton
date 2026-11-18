import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { createTeamValidator } from "@shared/validators"
import { invitePolicies, sports } from "@shared/types"
import Button from "../shared/Button";
import client from "../../client"
import type { InferRequestType } from "hono/client"
import type { TeamMembership } from "../account/AccountPage"

type TeamFormProps = {
    onClose: () => void
    onTeamCreated: (team: TeamMembership) => void
}

type CreateTeamRequest = InferRequestType<typeof client.team.create.$post>["json"]
type Sport = (typeof sports)[number]

const sportIcons: Record<Sport, string> = {
    Basketball: "sports_basketball",
    Baseball: "sports_baseball",
    Football: "sports_football",
    Soccer: "sports_soccer",
    Bocce: "sports_volleyball",
    Tennis: "sports_tennis",
}

export default function CreateTeam({ onClose, onTeamCreated }: TeamFormProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [createTeamError, setCreateTeamError] = useState("")
    const { clearErrors, formState: { errors, isSubmitting },
        handleSubmit, register } = useForm({
            resolver: zodResolver(createTeamValidator),
            defaultValues: { name: "", invitePolicy: "Open" },
        });

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        dialog.showModal()
    }, [])

    async function createTeam(values: CreateTeamRequest) {
        clearErrors()
        setCreateTeamError("")

        try {
            const response = await client.team.create.$post({ json: values })
            const result = await response.json()

            if ("error" in result) {
                setCreateTeamError(String(result.error))
                return
            }

            onTeamCreated({ ...result.data, role: "Captain" })
            onClose()
        } catch (error) {
            console.error(error)
            setCreateTeamError("Unable to create your team. Please try again.")
        }
    }

    return (
        <dialog
            aria-labelledby="create-team-title"
            className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-150 overflow-y-auto border-2 border-text-main bg-surface p-0 text-text-main shadow-hard backdrop:bg-text-main/60"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
            ref={dialogRef}>
            <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-text-main bg-surface p-4">
                <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight" id="create-team-title">
                    Create a New Team
                </h1>
                <button
                    aria-label="Close create team form"
                    className="border-2 border-text-main px-3 py-1 font-bold hover:bg-primary hover:text-white"
                    onClick={onClose}
                    type="button"
                >
                    <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
            </header>
            <main className="px-4 py-6 sm:px-8">
                {createTeamError && (
                    <p className="mb-6 border-2 border-accent bg-surface p-4 font-bold text-accent" role="alert">
                        {createTeamError}
                    </p>
                )}

                <form className="flex flex-col gap-12" noValidate onSubmit={handleSubmit(createTeam)}>
                    <section className="scroll-mt-24" id="sport-selection" tabIndex={-1}>
                        <fieldset>
                            <legend className="mb-6 font-heading text-2xl font-bold leading-tight text-text-main">
                                Which sport will your team play?
                            </legend>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {sports.map((sport) => {
                                    const id = `sport-${sport.toLowerCase()}`
                                    return (
                                        <label
                                            className="group relative flex h-37.5 cursor-pointer flex-col items-center justify-center border-2 border-text-main bg-surface p-4 text-center shadow-hard-hover transition-colors has-checked:bg-primary/10 has-checked:outline-2 has-checked:outline-primary has-focus-visible:outline-4 has-focus-visible:outline-accent"
                                            htmlFor={id}
                                            key={sport}
                                        >
                                            <input
                                                aria-describedby={errors.sport ? "sport-error" : undefined}
                                                aria-invalid={Boolean(errors.sport)}
                                                className="sr-only"
                                                id={id}
                                                type="radio"
                                                value={sport}
                                                {...register("sport")}
                                            />
                                            <span aria-hidden="true" className="material-symbols-outlined mb-3 text-4xl text-primary">
                                                {sportIcons[sport]}
                                            </span>
                                            <span className="text-lg font-bold text-text-main">{sport}</span>
                                        </label>
                                    )
                                })}
                            </div>
                            {errors.sport && (
                                <p className="mt-3 font-bold text-accent" id="sport-error">
                                    {errors.sport.message}
                                </p>
                            )}
                        </fieldset>
                    </section>

                    <section className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-bold text-text-main" htmlFor="team-name">
                                Team Name
                            </label>
                            <input
                                aria-describedby={errors.name ? "team-name-error" : undefined}
                                aria-invalid={Boolean(errors.name)}
                                className="w-full border-2 border-text-main bg-surface p-4 text-lg text-text-main shadow-hard placeholder:text-muted focus:border-primary focus:outline-none"
                                id="team-name"
                                placeholder="e.g. Mountain Top Ballers"
                                type="text"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="font-bold text-accent" id="team-name-error">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <label className="text-lg font-bold text-text-main" htmlFor="invitation-policy">
                            Invitation Policy
                        </label>
                        <select
                            className="w-full border-2 border-text-main bg-surface p-4 text-lg text-text-main focus:border-primary focus:outline-none"
                            id="invitation-policy"
                            {...register("invitePolicy")}
                        >
                            {invitePolicies.map((invitePolicy) => (
                                <option key={invitePolicy} value={invitePolicy}>
                                    {invitePolicy === "Open" ? "Open" : "Invite Only"}
                                </option>
                            ))}
                        </select>
                    </section>

                    <div className="flex flex-col-reverse gap-3 border-t-2 border-text-main/20 pt-6 sm:flex-row sm:justify-end">
                        <Button onClick={onClose} type="button" variant="action">
                            Cancel
                        </Button>
                        <Button className="py-3 text-base" disabled={isSubmitting} type="submit" variant="primary">
                            <span aria-hidden="true" className="material-symbols-outlined mr-1 align-middle text-base">group_add</span>
                            {isSubmitting ? "Creating..." : "Create Team"}
                        </Button>
                    </div>
                </form>
            </main>
        </dialog>
    )
}
