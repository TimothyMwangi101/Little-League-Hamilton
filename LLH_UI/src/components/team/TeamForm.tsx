import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import * as z from "zod"
import { createTeamValidator } from "@shared/validators"
import { sports, type Sport } from "@shared/types"
import client from "../../client"
import Button from "../shared/Button"
import type { InferRequestType } from "hono/client"

export type Team = InferRequestType<typeof client.team.create.$post>["json"]
type CreateTeamFormValues = z.input<typeof createTeamValidator>

const sportIcons: Record<Sport, string> = {
    Basketball: "sports_basketball",
    Baseball: "sports_baseball",
    Football: "sports_football",
    Soccer: "sports_soccer",
    Bocce: "sports_volleyball",
    Tennis: "sports_tennis",
}

export default function CreateTeam() {
    const [successMessage, setSuccessMessage] = useState("")
    const { clearErrors, formState: { errors, isSubmitting },
        handleSubmit, register, reset,setError } = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamValidator),
        defaultValues: { name: "", invitePolicy: "Open" },
    })

    async function createTeam(values: CreateTeamFormValues) {
        setSuccessMessage("")
        clearErrors()

        try {
            const response = await client.team.create.$post({ json: values })
            const result = await response.json()

            if ("error" in result) {
                setError("root.serverError", { message: String(result.error) })
                return
            }

            reset({ name: "", invitePolicy: "Open" })
            setSuccessMessage("Your team was created successfully.")
        } catch (error) {
            console.error(error)
            setError("root.serverError", {
                message: "Unable to create your team. Please try again.",
            })
        }
    }

    const hasValidationErrors = Boolean(errors.name || errors.sport)

    return (
        <>
            <header className="sticky top-0 z-10 border-b-2 border-text-main bg-surface p-4 shadow-hard">
                <Link
                    className="inline-flex items-center gap-2 font-bold text-text-main transition-colors hover:text-primary"
                    to="/account">
                    <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
                    Back to Account
                </Link>
            </header>
            <main className="mx-auto w-full max-w-150 px-4 py-8 pb-24">
                <div className="mb-8 flex flex-col gap-3">
                    <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-text-main">
                        Create a New Team
                    </h1>
                    <p className="text-lg font-bold text-muted">Team Details</p>
                </div>

                {successMessage && (
                    <p aria-live="polite" className="mb-6 border-2 border-primary bg-surface p-4 font-bold text-primary" role="status">
                        {successMessage}
                    </p>
                )}

                {errors.root?.serverError && (
                    <p className="mb-6 border-2 border-accent bg-surface p-4 font-bold text-accent" role="alert">
                        {errors.root.serverError.message}
                    </p>
                )}

                {hasValidationErrors && (
                    <div aria-live="assertive" className="mb-8 border-2 border-accent bg-surface p-5 text-accent shadow-hard" role="alert">
                        <p className="text-lg font-bold">Please fix the following:</p>
                        <ul className="mt-2 list-disc pl-6">
                            {errors.sport && (
                                <li>
                                    <a className="underline underline-offset-2" href="#sport-selection">
                                        {errors.sport.message}
                                    </a>
                                </li>
                            )}
                            {errors.name && (
                                <li>
                                    <a className="underline underline-offset-2" href="#team-name">
                                        {errors.name.message}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <form className="flex flex-col gap-12" noValidate onSubmit={handleSubmit(createTeam)}>
                    <section className="scroll-mt-24" id="sport-selection">
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
                        <h2 className="font-heading text-2xl font-bold leading-tight text-text-main">
                            Basic Information
                        </h2>
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

                    <div className="border-t-2 border-text-main/20 pt-6">
                        <Button className="w-full py-4 text-base" disabled={isSubmitting} type="submit" variant="primary">
                            {isSubmitting ? "Creating..." : "Create Team"}
                            <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
                        </Button>
                    </div>
                </form>
            </main>
        </>
    )
}
