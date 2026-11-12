import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { regions, sports, type Region, type Sport } from "@shared/types"
import { updateAccountValidator } from "@shared/validators"
import type { Account, AccountUpdates } from "./AccountPage"
import Button from "../shared/Button"

type ProfileSectionProps = {
    account: Account["AccountsTable"]
    email: Account["email"]
    isSaving: boolean
    onSave: (updates: AccountUpdates) => Promise<boolean>
}

type AccountFormValues = z.input<typeof updateAccountValidator>

function isRegion(value: string): value is Region {
    return regions.some((region) => region === value)
}

export default function ProfileSection({ account, email, isSaving, onSave }: ProfileSectionProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingRegion, setIsEditingRegion] = useState(false)
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
    const memberSince = new Date(`${account.createdAt}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })

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

    return (
        <section aria-label="Profile and membership summary" className="mb-8 grid gap-6 lg:grid-cols-[1fr_480px]">
            <div className="flex flex-col justify-between gap-6 border-2 border-text-main bg-surface p-5 shadow-hard sm:p-7">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <div aria-hidden="true" className="flex size-32 shrink-0 items-center justify-center border-2 border-text-main bg-primary text-white shadow-hard sm:size-36">
                        <span className="material-symbols-outlined" style={{fontSize: "64px" }}>person</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="wrap-break-words font-heading text-2xl font-bold uppercase text-primary sm:text-3xl" id="profile-heading">
                            {greetingName}
                        </h2>
                        <p className="mt-1 break-all font-bold uppercase tracking-wide text-muted">{email}</p>
                        {!isEditingName && (
                            <Button
                                className="mt-4"
                                disabled={isBusy}
                                onClick={() => {
                                    resetAccountForm()
                                    setIsEditingName(true)
                                }}
                                type="button"
                                variant="action"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                                Edit name
                            </Button>
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
                        <Button variant="primary" disabled={isBusy} type="submit">
                            {isBusy ? "Saving..." : "Save name"}
                        </Button>
                        <Button
                            disabled={isBusy}
                            onClick={() => {
                                resetAccountForm()
                                setIsEditingName(false)
                            }}
                            type="button"
                            variant="action"
                        >
                            Cancel
                        </Button>
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
                        <Button
                            aria-label="Edit region"
                            disabled={isBusy}
                            onClick={() => {
                                resetAccountForm()
                                setIsEditingRegion(true)
                            }}
                            type="button"
                            variant="action"
                        >
                            Edit
                        </Button>
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
                    <Button variant="primary" disabled={isBusy} type="submit">
                        {isBusy ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        disabled={isBusy}
                        onClick={() => {
                            resetAccountForm()
                            setIsEditingRegion(false)
                        }}
                        type="button"
                        variant="action"
                    >
                        Cancel
                    </Button>
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
    )
}
