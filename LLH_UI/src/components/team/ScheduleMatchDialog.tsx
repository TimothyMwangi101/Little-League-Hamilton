import { useEffect, useRef, useState, type FormEvent } from 'react'
import client from '../../client'

type ScheduleMatchDialogProps = {
  teamId: number
  teamName: string
  onClose: () => void
  onScheduled: (notice: string) => void
}

export default function ScheduleMatchDialog({
  teamId,
  teamName,
  onClose,
  onScheduled,
}: ScheduleMatchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [opponentTeamName, setOpponentTeamName] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function scheduleMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await client.team[':teamId'].matches.$post({
        param: { teamId: String(teamId) },
        json: {
          opponentTeamName: opponentTeamName.trim(),
          matchDate: new Date(matchDate).toISOString(),
        },
      })
      const result = await response.json()

      if (!response.ok || 'error' in result) {
        throw new Error(
          'error' in result && typeof result.error === 'string'
            ? result.error
            : 'Unable to schedule the match.',
        )
      }

      onScheduled(
        'warning' in result && typeof result.warning === 'string'
          ? result.warning
          : `Match scheduled with ${opponentTeamName.trim()}. The opposing team has been notified.`,
      )
      onClose()
    } catch (requestError) {
      console.error('Unable to schedule match', requestError)
      setError(requestError instanceof Error
        ? requestError.message
        : 'Unable to schedule the match. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      aria-labelledby="schedule-match-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto border-2 border-text-main bg-white p-0 text-text-main shadow-hard backdrop:bg-text-main/60"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      ref={dialogRef}
    >
      <header className="flex items-center justify-between gap-4 border-b-2 border-text-main bg-primary p-4 text-white">
        <h2 className="font-heading text-2xl font-bold" id="schedule-match-title">Schedule a Match</h2>
        <button
          aria-label="Close schedule match"
          className="border-2 border-text-main bg-white px-3 py-1 font-bold text-text-main hover:bg-off-white"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">close</span>
        </button>
      </header>

      <form className="flex flex-col gap-5 p-5 sm:p-8" onSubmit={scheduleMatch}>
        <p className="text-sm text-muted">
          Schedule a match for <strong className="text-text-main">{teamName}</strong>. The opposing captain and co-captain will be emailed to accept or reject it.
        </p>

        {error && (
          <p className="border-2 border-accent bg-off-white p-3 font-bold text-accent" role="alert">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-2 font-bold" htmlFor="opponent-team-name">
          Opposing team name
          <input
            autoComplete="off"
            className="w-full border-2 border-text-main bg-white p-3 font-normal focus:outline-none focus:shadow-hard"
            id="opponent-team-name"
            onChange={(event) => setOpponentTeamName(event.target.value)}
            required
            type="text"
            value={opponentTeamName}
          />
        </label>

        <label className="flex flex-col gap-2 font-bold" htmlFor="match-date">
          Match date and time
          <input
            className="w-full border-2 border-text-main bg-white p-3 font-normal focus:outline-none focus:shadow-hard"
            id="match-date"
            onChange={(event) => setMatchDate(event.target.value)}
            required
            type="datetime-local"
            value={matchDate}
          />
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
            {isSubmitting ? 'Scheduling...' : 'Schedule Match'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
