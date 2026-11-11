import { useState } from "react"
import type { Account, AccountUpdates } from "./AccountPage"
import { regions, sports, type Region, type Sport } from '@shared/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateAccountValidator } from '@shared/validators';
import * as z from 'zod';

type AccountViewProps = {
    account: Account["AccountsTable"]
    email: Account["email"]
    isSaving: boolean
    onSave: (updates: AccountUpdates) => Promise<boolean>
    saveError: string
}

type AccountFormValues = z.input<typeof updateAccountValidator>

function isRegion(value: string): value is Region {
    return regions.some((region) => region === value)
}

const actionButtonClass =
    "inline-flex items-center gap-2 border-2 border-text-main px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-hard-hover transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
const primaryButtonClass =
    "border-2 border-text-main bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-hard-hover transition-all hover:bg-auth-green disabled:cursor-not-allowed disabled:opacity-60"

export default function AccountView({ account, email, isSaving, onSave, saveError }: AccountViewProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingRegion, setIsEditingRegion] = useState(false)
    const [isEditingSports, setIsEditingSports] = useState(false)
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

    function resetAccountForm() {
        reset({
            firstName: account.firstName ?? "",
            lastName: account.lastName ?? "",
            region: account.region,
            prefers: account.prefers.filter((sport): sport is Sport => sports.some((option) => option === sport)),
        })
    }

    const greetingName = [account.firstName, account.lastName]
        .filter((name) => name?.trim())
        .join(" ") || email
    const stats = [
        { label: "Goals", value: account.goals, icon: "sports_soccer" },
        { label: "Assists", value: account.assists, icon: "handshake" },
        { label: "Wins", value: account.wins, icon: "emoji_events" },
        { label: "Losses", value: account.losses, icon: "sentiment_dissatisfied" },
    ]

    async function saveName(values: AccountFormValues) {
        const firstName = values.firstName?.trim() ?? ""
        const lastName = values.lastName?.trim() ?? ""
        if (await onSave({
            firstName: firstName || null,
            lastName: lastName || null,
        })) {
            reset({ ...values, firstName, lastName })
            setIsEditingName(false)
        }
    }

    async function saveRegion(values: AccountFormValues) {
        if (await onSave({ region: values.region ?? null }))
            setIsEditingRegion(false)
    }

    async function saveSports(values: AccountFormValues) {
        if (await onSave({ prefers: values.prefers ?? [] }))
            setIsEditingSports(false)
    }

    function cancelNameEdit() {
        resetAccountForm()
        setIsEditingName(false)
    }

    function cancelRegionEdit() {
        resetAccountForm()
        setIsEditingRegion(false)
    }

    function cancelSportsEdit() {
        resetAccountForm()
        setIsEditingSports(false)
    }

    const memberSince = new Date(`${account.createdAt}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })

    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
            {saveError && (
                <p role="alert" className="mb-5 border-2 border-accent bg-surface p-3 font-bold text-accent">
                    {saveError}
                </p>
            )}

            <section aria-label="Profile and membership summary" className="mb-8 grid gap-6 lg:grid-cols-[1fr_480px]">
                <div className="flex flex-col justify-between gap-6 border-2 border-text-main bg-surface p-5 shadow-hard sm:p-7">
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                        <div aria-hidden="true" className="flex size-32 shrink-0 items-center justify-center border-2 border-text-main bg-primary text-white shadow-hard sm:size-36">
                            <span className="material-symbols-outlined text-7xl">person</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="wrap-break-words font-heading text-2xl font-bold uppercase text-primary sm:text-3xl" id="profile-heading">
                                {greetingName}
                            </h2>
                            <p className="mt-1 break-all font-bold uppercase tracking-wide text-muted">{email}</p>
                            {!isEditingName && (
                                <button
                                    className={`${actionButtonClass} mt-4`}
                                    disabled={isBusy}
                                    onClick={() => {
                                        resetAccountForm()
                                        setIsEditingName(true)
                                    }}
                                    type="button"
                                >
                                    <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                                    Edit name
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditingName && (
                        <form className="grid gap-3 border-t-2 border-text-main/10 pt-5 sm:grid-cols-2" onSubmit={handleSubmit(saveName)}>
                            <label className="text-sm font-bold uppercase tracking-wide text-muted">
                                First name
                                <input
                                    autoComplete="given-name"
                                    className="mt-1 w-full border-2 border-text-main bg-surface p-2 text-text-main"
                                    maxLength={50}
                                    aria-invalid={Boolean(errors.firstName)}
                                    disabled={isBusy}
                                    {...register("firstName")}
                                />
                                {errors.firstName?.message && (
                                    <span role="alert" className="mt-1 block text-xs font-bold text-accent">
                                        {errors.firstName.message}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm font-bold uppercase tracking-wide text-muted">
                                Last name
                                <input
                                    autoComplete="family-name"
                                    className="mt-1 w-full border-2 border-text-main bg-surface p-2 text-text-main"
                                    maxLength={50}
                                    aria-invalid={Boolean(errors.lastName)}
                                    disabled={isBusy}
                                    {...register("lastName")}
                                />
                                {errors.lastName?.message && (
                                    <span role="alert" className="mt-1 block text-xs font-bold text-accent">
                                        {errors.lastName.message}
                                    </span>
                                )}
                            </label>
                            <div className="flex gap-2 sm:col-span-2">
                                <button className={primaryButtonClass} disabled={isBusy} type="submit">
                                    {isBusy ? "Saving..." : "Save name"}
                                </button>
                                <button className={actionButtonClass} disabled={isBusy} onClick={cancelNameEdit} type="button">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="flex flex-col justify-center gap-5 border-2 border-text-main bg-surface p-5 shadow-hard sm:p-7">
                    <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">location_on</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold uppercase tracking-wider text-muted">Region</p>
                            <p className="mt-1 wrap-break-words font-bold text-text-main">{account.region ?? "No region selected"}</p>
                        </div>
                        {!isEditingRegion && (
                            <button
                                aria-label="Edit region"
                                className={actionButtonClass}
                                disabled={isBusy}
                                onClick={() => {
                                    resetAccountForm()
                                    setIsEditingRegion(true)
                                }}
                                type="button"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    {isEditingRegion && (
                        <form className="flex flex-wrap gap-2" onSubmit={handleSubmit(saveRegion)}>
                            <select
                                aria-label="Region"
                                className="min-w-0 flex-1 border-2 border-text-main bg-surface p-2 text-text-main"
                                aria-invalid={Boolean(errors.region)}
                                disabled={isBusy}
                                {...register("region", {
                                    setValueAs: (value: string) => isRegion(value) ? value : null,
                                })}
                            >
                                <option value="">No region selected</option>
                                {regions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                            {errors.region?.message && (
                                <span role="alert" className="w-full text-xs font-bold text-accent">
                                    {errors.region.message}
                                </span>
                            )}
                            <button className={primaryButtonClass} disabled={isBusy} type="submit">
                                {isBusy ? "Saving..." : "Save"}
                            </button>
                            <button className={actionButtonClass} disabled={isBusy} onClick={cancelRegionEdit} type="button">
                                Cancel
                            </button>
                        </form>
                    )}
                    <div className="flex items-start gap-3 border-t border-text-main/10 pt-4">
                        <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">calendar_month</span>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-muted">Member since</p>
                            <p className="mt-1 font-bold text-text-main">{memberSince}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="stats-heading" className="mb-8">
                <div className="mb-4 border-b-2 border-text-main pb-2">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="stats-heading">
                        League stats
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map(({ label, value, icon }) => (
                        <article className="border-2 border-text-main bg-surface p-4 shadow-hard sm:p-5" key={label}>
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-bold uppercase tracking-wide text-muted">{label}</p>
                                <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                            </div>
                            <p className="font-heading text-4xl font-bold text-text-main">{value}</p>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
                <section aria-labelledby="sports-heading" className="border-2 border-text-main bg-surface shadow-hard">
                    <div className="flex items-center justify-between gap-3 border-b-2 border-text-main bg-background-light p-5">
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="sports-heading">
                            Sports I play
                        </h2>
                        {!isEditingSports && (
                            <button
                                className={actionButtonClass}
                                disabled={isBusy}
                                onClick={() => {
                                    resetAccountForm()
                                    setIsEditingSports(true)
                                }}
                                type="button"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <div className="p-5">
                        {isEditingSports ? (
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
                                    <button className={actionButtonClass} disabled={isBusy} onClick={cancelSportsEdit} type="button">
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

                <section aria-labelledby="teams-heading" className="border-2 border-text-main bg-surface shadow-hard">
                    <div className="border-b-2 border-text-main bg-background-light p-5">
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="teams-heading">
                            My team
                        </h2>
                    </div>
                    <p className="p-5 text-muted">
                        {account.team ? `You are a member of team #${account.team}.` : "You are not on a team yet."}
                    </p>
                </section>
            </div>
        </main>
    )
}
