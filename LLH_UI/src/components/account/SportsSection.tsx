import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { sports, type Sport } from "@shared/types"
import { updateAccountValidator } from "@shared/validators"
import type { Account, AccountUpdates } from "./AccountPage"
import { actionButtonClass, primaryButtonClass } from "./accountStyles"

type SportsSectionProps = {
    account: Account["AccountsTable"]
    isSaving: boolean
    onSave: (updates: AccountUpdates) => Promise<boolean>
}

type AccountFormValues = z.input<typeof updateAccountValidator>

export default function SportsSection({ account, isSaving, onSave }: SportsSectionProps) {
    const [isEditing, setIsEditing] = useState(false)
    const {
        handleSubmit,
        register,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AccountFormValues>({
        resolver: zodResolver(updateAccountValidator),
        defaultValues: {
            firstName: account.firstName ?? "",
            lastName: account.lastName ?? "",
            region: account.region,
            prefers: account.prefers.filter((sport): sport is Sport => sports.some((option) => option === sport)),
        },
    })
    const isBusy = isSaving || isSubmitting

    async function saveSports(values: AccountFormValues) {
        if (await onSave({ prefers: values.prefers ?? [] }))
            setIsEditing(false)
    }

    return (
        <section aria-labelledby="sports-heading" className="border-2 border-text-main bg-surface shadow-hard">
            <div className="flex items-center justify-between gap-3 border-b-2 border-text-main bg-background-light p-5">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="sports-heading">
                    Sports I play
                </h2>
                {!isEditing && (
                    <button
                        className={actionButtonClass}
                        disabled={isBusy}
                        onClick={() => {
                            reset({
                                firstName: account.firstName ?? "",
                                lastName: account.lastName ?? "",
                                region: account.region,
                                prefers: account.prefers.filter((sport): sport is Sport => sports.some((option) => option === sport)),
                            })
                            setIsEditing(true)
                        }}
                        type="button"
                    >
                        Edit
                    </button>
                )}
            </div>
            <div className="p-5">
                {isEditing ? (
                    <form onSubmit={handleSubmit(saveSports)}>
                        <fieldset className="grid gap-3 sm:grid-cols-2">
                            <legend className="sr-only">Choose the sports you play</legend>
                            {sports.map((sport) => (
                                <label className="flex cursor-pointer items-center gap-3 font-bold text-text-main" key={sport}>
                                    <input
                                        className="size-5 accent-primary"
                                        disabled={isBusy}
                                        type="checkbox"
                                        value={sport}
                                        aria-invalid={Boolean(errors.prefers)}
                                        {...register("prefers")}
                                    />
                                    {sport}
                                </label>
                            ))}
                        </fieldset>
                        {errors.prefers?.message && (
                            <p role="alert" className="mt-3 text-xs font-bold text-accent">
                                {errors.prefers.message}
                            </p>
                        )}
                        <div className="mt-5 flex gap-2">
                            <button className={primaryButtonClass} disabled={isBusy} type="submit">
                                {isBusy ? "Saving..." : "Save sports"}
                            </button>
                            <button
                                className={actionButtonClass}
                                disabled={isBusy}
                                onClick={() => setIsEditing(false)}
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : account.prefers.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {account.prefers.map((sport) => (
                            <span className="border-2 border-text-main bg-primary px-4 py-2 font-bold uppercase tracking-wide text-white" key={sport}>
                                {sport}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">No sports selected yet.</p>
                )}
            </div>
        </section>
    )
}
