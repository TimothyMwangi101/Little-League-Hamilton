import { useEffect, useMemo, useState } from 'react'
import { invitePolicies, type InvitePolicy } from '@shared/types';
import client from '../../client';
import type { InferResponseType } from 'hono';
import type { StatusCodes } from 'http-status-codes';

type Teams = InferResponseType<typeof client.teams.$get, StatusCodes.OK>["data"];

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState<Teams>([])
  const [selectedInvitePolicies, setSelectedInvitePolicies] = useState<InvitePolicy[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadTeams() {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await client.teams.$get()
        const result = await response.json()

        if (!response.ok || 'error' in result)
          throw new Error('error' in result ? String(result.error) : 'Unable to load teams.')

        if (isCurrent) setTeams(result.data)
      } catch (error) {
        console.error(error)
        if (isCurrent) setLoadError('Unable to load teams. Please try again.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadTeams()
    return () => {
      isCurrent = false
    }
  }, [reloadCount])

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return teams.filter((team) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        team.name.toLowerCase().includes(normalizedQuery) ||
        String(team.captainId).includes(normalizedQuery)
      const matchesInvitePolicy =
        selectedInvitePolicies.length === 0 || selectedInvitePolicies.includes(team.invitePolicy)

      return matchesQuery && matchesInvitePolicy
    })
  }, [query, selectedInvitePolicies, teams])

  function toggleInvitePolicy(invitePolicy: InvitePolicy) {
    setSelectedInvitePolicies((current) =>
      current.includes(invitePolicy)
        ? current.filter((item) => item !== invitePolicy)
        : [...current, invitePolicy],
    )
  }

  function clearFilters() {
    setQuery('')
    setSelectedInvitePolicies([])
  }

  function renderFilters() {
    return (
      <>
        <div className="mb-8 flex items-center justify-between gap-2">
          <h1 className="font-heading text-3xl font-bold leading-tight">Filters</h1>
          <button
            className="text-sm font-bold underline hover:text-accent"
            onClick={clearFilters}
            type="button"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-8">
          <fieldset>
            <legend className="mb-4 w-full border-b-2 border-text-main pb-2 text-xl font-bold">
              Team access
            </legend>
            <div className="space-y-4">
              {invitePolicies.map((invitePolicy) => (
                <label className="group flex cursor-pointer items-center gap-3" key={invitePolicy}>
                  <input
                    checked={selectedInvitePolicies.includes(invitePolicy)}
                    className="size-6 cursor-pointer appearance-none border-2 border-text-main bg-white checked:bg-primary checked:before:block checked:before:text-center checked:before:text-lg checked:before:font-bold checked:before:text-white checked:before:content-['✓']"
                    onChange={() => toggleInvitePolicy(invitePolicy)}
                    type="checkbox"
                  />
                  <span className="text-lg group-hover:font-bold">
                    {invitePolicy === 'Open' ? 'Open' : 'Invite Only'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </>
    )
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 overflow-hidden">
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r-2 border-text-main bg-off-white p-6 md:block">
        {renderFilters()}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface p-4 sm:p-6">
        <div className="mb-4 md:hidden">
          <button
            aria-expanded={showMobileFilters}
            className="flex w-full items-center justify-between border-2 border-text-main bg-off-white px-4 py-3 text-left font-bold"
            onClick={() => setShowMobileFilters((shown) => !shown)}
            type="button"
          >
            <span>Filters</span>
            <span aria-hidden="true" className="material-symbols-outlined">
              {showMobileFilters ? 'expand_less' : 'tune'}
            </span>
          </button>
          {showMobileFilters && (
            <div className="border-x-2 border-b-2 border-text-main bg-off-white p-4">
              {renderFilters()}
            </div>
          )}
        </div>

        <form
          className="mb-8"
          onSubmit={(event) => {
            event.preventDefault()
          }}
          role="search"
        >
          <label className="sr-only" htmlFor="team-search">
            Search teams or captains
          </label>
          <div className="relative flex items-center">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 text-3xl">
              search
            </span>
            <input
              className="h-16 w-full border-2 border-text-main bg-off-white py-3 pl-14 pr-28 text-lg placeholder:text-muted focus:outline-none focus:shadow-hard"
              id="team-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams or captains..."
              type="search"
              value={query}
            />
            <button
              className="absolute right-2 border-2 border-text-main bg-primary px-4 py-3 font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:shadow-hard-hover active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-8"
              type="submit"
            >
              Search
            </button>
          </div>

          {selectedInvitePolicies.length > 0 && (
            <div aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
              {selectedInvitePolicies.map((invitePolicy) => (
                <button
                  aria-label={`Remove ${invitePolicy === 'Open' ? 'Open' : 'Invite Only'} filter`}
                  className="flex items-center gap-2 border-2 border-text-main bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-accent"
                  key={invitePolicy}
                  onClick={() => toggleInvitePolicy(invitePolicy)}
                  type="button"
                >
                  {invitePolicy === 'Open' ? 'Open' : 'Invite Only'}
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="mb-6">
          <h2 aria-live="polite" className="font-heading text-2xl font-bold">
            Results ({isLoading || loadError ? 0 : filteredTeams.length})
          </h2>
        </div>

        {isLoading ? (
          <p aria-live="polite" className="border-2 border-text-main bg-off-white p-8 text-center">
            Loading teams...
          </p>
        ) : loadError ? (
          <div className="border-2 border-text-main bg-off-white p-8 text-center">
            <p className="font-bold" role="alert">{loadError}</p>
            <button
              className="mt-4 border-2 border-text-main bg-primary px-6 py-3 font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:shadow-hard-hover"
              onClick={() => setReloadCount((count) => count + 1)}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <article
                className="flex h-full flex-col justify-between border-2 border-text-main bg-white p-6 transition-shadow hover:shadow-hard"
                key={team.id}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span
                      className={`flex items-center gap-1 font-bold ${team.invitePolicy === 'Open' ? 'text-primary' : 'text-muted'}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-xl">
                        {team.invitePolicy === 'Open' ? 'person' : 'lock'}
                      </span>
                      {team.invitePolicy === 'Open' ? 'Open' : 'Invite Only'}
                    </span>
                  </div>
                  <h3 className="mb-2 font-heading text-2xl font-bold leading-tight">{team.name}</h3>
                  <div className="mb-6 space-y-2 border-t-2 border-dashed border-muted pt-4">
                    <p className="text-base">
                      <strong>Captain account:</strong> #{team.captainId}
                    </p>
                  </div>
                </div>
                <p className="border-2 border-text-main bg-off-white py-3 text-center font-bold uppercase tracking-wider">
                  Team details coming soon
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-2 border-text-main bg-off-white p-8 text-center">
            <h3 className="font-heading text-xl font-bold">No teams found</h3>
            <p className="mt-2 text-muted">Try another search or clear your filters.</p>
          </div>
        )}
      </main>
    </div>
  )
}
