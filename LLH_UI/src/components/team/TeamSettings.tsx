

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import client from '../../client'

type TeamSettingsProps = {
  teamId: number
  onClose: () => void
  onPromoted: () => void
}

type PromotePlayerFormValues = {
  email: string
}

export default function TeamSettings({ teamId, onClose, onPromoted }: TeamSettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<PromotePlayerFormValues>({ defaultValues: { email: '' } })

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function promotePlayer({ email }: PromotePlayerFormValues) {
    clearErrors()
    try {
      const lookupResponse = await client.user.$query({ json: { email: email.trim() } })
      const lookupResult = await lookupResponse.json()

      if (!lookupResponse.ok || 'error' in lookupResult) {
        throw new Error(
          'error' in lookupResult && typeof lookupResult.error === 'string'
            ? lookupResult.error
            : 'Unable to find that player.',
        )
      }

      const promotionResponse = await client.team[':teamId'].members[':userId'].cocaptain.$patch({
        param: { teamId: String(teamId), userId: String(lookupResult.data.id) },
      })
      const promotionResult = await promotionResponse.json()

      if (!promotionResponse.ok || 'error' in promotionResult) {
        throw new Error(
          'error' in promotionResult && typeof promotionResult.error === 'string'
            ? promotionResult.error
            : 'Unable to promote that player.',
        )
      }

      onPromoted()
      onClose()
    } catch (requestError) {
      console.error('Unable to promote team member', requestError)
      setError('root.serverError', {
        type: 'server',
        message: requestError instanceof Error
          ? requestError.message
          : 'Unable to promote that player. Please try again.',
      })
    }
  }

  return (
    <dialog
      aria-labelledby="team-settings-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto border-2 border-text-main bg-white p-0 text-text-main shadow-hard backdrop:bg-text-main/60"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      ref={dialogRef}
    >
      <header className="flex items-center justify-between gap-4 border-b-2 border-text-main bg-primary p-4 text-white">
        <h2 className="font-heading text-2xl font-bold" id="team-settings-title">Team Settings</h2>
        <button
          aria-label="Close team settings"
          className="border-2 border-text-main bg-white px-3 py-1 font-bold text-text-main hover:bg-off-white"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">close</span>
        </button>
      </header>

      <form className="flex flex-col gap-5 p-5 sm:p-8" onSubmit={handleSubmit(promotePlayer)}>
        <div>
          <h3 className="font-heading text-xl font-bold">Promote a player</h3>
          <p className="mt-1 text-sm text-muted">
            Enter a team member’s account email to make them a co-captain.
          </p>
        </div>

        {errors.root?.serverError && (
          <p className="border-2 border-accent bg-off-white p-3 font-bold text-accent" role="alert">
            {errors.root.serverError.message}
          </p>
        )}

        <label className="flex flex-col gap-2 font-bold" htmlFor="player-email">
          Player email
          <input
            aria-describedby={errors.email ? 'player-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="w-full border-2 border-text-main bg-white p-3 font-normal focus:outline-none focus:shadow-hard"
            id="player-email"
            type="email"
            {...register('email', { required: 'Player email is required.' })}
          />
          {errors.email && (
            <span className="font-bold text-accent" id="player-email-error" role="alert">
              {errors.email.message}
            </span>
          )}
        </label>

        <div className="flex flex-col-reverse gap-3 border-t-2 border-text-main/20 pt-5 sm:flex-row sm:justify-end">
          <button
            className="border-2 border-text-main bg-white px-5 py-3 font-bold uppercase tracking-wide hover:bg-off-white"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="border-2 border-text-main bg-primary px-5 py-3 font-bold uppercase tracking-wide text-white shadow-hard-hover transition-all hover:shadow-hard disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Promoting...' : 'Promote to Co-captain'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
