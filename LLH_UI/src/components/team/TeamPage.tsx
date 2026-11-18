import { useEffect, useMemo, useState } from 'react'
import type { InferResponseType } from 'hono/client'
import { StatusCodes } from 'http-status-codes'
import { hasRole } from '@shared/types'
import { useNavigate } from 'react-router'
import client from '../../client'
import ScheduleMatchDialog from './ScheduleMatch'
import TeamSettings from './TeamSettings'

type Account = InferResponseType<typeof client.account.$get, StatusCodes.OK>['data']
const getTeamMatches = client.team[':teamId'].matches.$get
type TeamMatch = InferResponseType<typeof getTeamMatches, StatusCodes.OK>['data'][number]
const getTeamMembers = client.team[':teamId'].members.$get
type TeamMember = InferResponseType<typeof getTeamMembers, StatusCodes.OK>['data'][number]

function displayInvitePolicy(invitePolicy: Account['teams'][number]['team']['invitePolicy']) {
  return invitePolicy === 'Open' ? 'Open team' : 'Invite only'
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TeamPage() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<Account | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = useState(false)
  const [isScheduleMatchOpen, setIsScheduleMatchOpen] = useState(false)
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [matchesError, setMatchesError] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [respondingMatchId, setRespondingMatchId] = useState<number | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadAccount() {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await client.account.$get()
        const statusCode: number = response.status

        if (statusCode === StatusCodes.UNAUTHORIZED) {
          await navigate('/login', { replace: true })
          return
        }

        const result = await response.json()
        if (!response.ok || 'error' in result)
          throw new Error('error' in result ? String(result.error) : 'Unable to load your teams.')

        if (isCurrent) {
          setAccount(result.data)
          setSelectedTeamId((current) =>
            current !== null && result.data.teams.some(({ team }) => team.id === current)
              ? current
              : result.data.teams[0]?.team.id ?? null,
          )
        }
      } catch (error) {
        console.error('Unable to load your teams', error)
        if (isCurrent) setLoadError('Unable to load your teams. Please try again.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadAccount()

    return () => {
      isCurrent = false
    }
  }, [navigate, reloadCount])

  useEffect(() => {
    if (selectedTeamId === null) return

    let isCurrent = true

    async function loadMatches() {
      setIsLoadingMatches(true)
      setMatchesError('')

      try {
        const response = await client.team[':teamId'].matches.$get({
          param: { teamId: String(selectedTeamId) },
        })
        const result = await response.json()

        if (!response.ok || 'error' in result)
          throw new Error('error' in result ? String(result.error) : 'Unable to load team matches.')

        if (isCurrent) setTeamMatches(result.data)
      } catch (error) {
        console.error('Unable to load team matches', error)
        if (isCurrent) setMatchesError('Unable to load team matches. Please try again.')
      } finally {
        if (isCurrent) setIsLoadingMatches(false)
      }
    }

    void loadMatches()

    return () => {
      isCurrent = false
    }
  }, [selectedTeamId, reloadCount])

  useEffect(() => {
    if (selectedTeamId === null) return

    let isCurrent = true

    async function loadTeamMembers() {
      setIsLoadingMembers(true)
      setMembersError('')

      try {
        const response = await getTeamMembers({
          param: { teamId: String(selectedTeamId) },
        })
        const result = await response.json()

        if (!response.ok || 'error' in result)
          throw new Error('error' in result ? String(result.error) : 'Unable to load the team roster.')

        if (isCurrent) setTeamMembers(result.data)
      } catch (error) {
        console.error('Unable to load the team roster', error)
        if (isCurrent) setMembersError('Unable to load the team roster. Please try again.')
      } finally {
        if (isCurrent) setIsLoadingMembers(false)
      }
    }

    void loadTeamMembers()

    return () => {
      isCurrent = false
    }
  }, [selectedTeamId, reloadCount])

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (account?.teams ?? []).filter(({ team }) =>
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.sport.toLowerCase().includes(normalizedQuery) ||
      String(team.id).includes(normalizedQuery),
    )
  }, [account, query])

  const selectedTeam = account?.teams.find(({ team }) => team.id === selectedTeamId) ?? null
  const currentMembership = selectedTeam
  const canManageTeam = currentMembership !== null && hasRole(currentMembership.role, 'CoCaptain')
  const currentMemberName = account
    ? [account.AccountsTable.firstName, account.AccountsTable.lastName].filter(Boolean).join(' ') || account.email
    : ''

  async function respondToMatch(matchId: number, status: 'Accepted' | 'Rejected') {
    setRespondingMatchId(matchId)
    setActionNotice('')

    try {
      const response = await client.team[':teamId'].matches[':matchId'].respond.$patch({
        param: { teamId: String(selectedTeamId), matchId: String(matchId) },
        json: { status },
      })
      const result = await response.json()

      if (!response.ok || 'error' in result)
        throw new Error('error' in result ? String(result.error) : `Unable to ${status.toLowerCase()} the match.`)

      setActionNotice(`Match ${status.toLowerCase()}.`)
      setReloadCount((count) => count + 1)
    } catch (error) {
      console.error(`Unable to ${status.toLowerCase()} match`, error)
      setActionNotice(error instanceof Error ? error.message : `Unable to ${status.toLowerCase()} the match.`)
    } finally {
      setRespondingMatchId(null)
    }
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto bg-off-white p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-2 border-b-2 border-text-main pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
              <span aria-hidden="true" className="material-symbols-outlined">groups</span>
              Your team access
            </p>
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">My Teams</h1>
            <p className="mt-2 text-muted">Team details are available to team members only.</p>
          </div>
          {account && account.teams.length > 1 && <label className="relative w-full sm:max-w-xs">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted">
              search
            </span>
            <span className="sr-only">Search your teams</span>
            <input
              className="w-full border-2 border-text-main bg-white py-3 pl-10 pr-3 focus:outline-none focus:shadow-hard"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your teams"
              type="search"
              value={query}
            />
          </label>}
        </header>

        {isLoading ? (
          <p aria-live="polite" className="border-2 border-text-main bg-white p-8 text-center" role="status">
            Verifying team membership...
          </p>
        ) : loadError ? (
          <div className="border-2 border-text-main bg-white p-8 text-center">
            <p className="font-bold" role="alert">{loadError}</p>
            <button
              className="mt-4 border-2 border-text-main bg-primary px-6 py-3 font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:shadow-hard-hover"
              onClick={() => setReloadCount((count) => count + 1)}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : account?.teams.length === 0 ? (
          <section aria-labelledby="team-access-required" className="border-2 border-text-main bg-white p-6 shadow-hard">
            <h2 className="font-heading text-2xl font-bold" id="team-access-required">Team membership required</h2>
            <p className="mt-2 text-muted">
              This page contains private team information and is available only to members of a team.
            </p>
          </section>
        ) : account ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,2fr)]">
            <section aria-labelledby="team-list-heading" className="h-fit border-2 border-text-main bg-white shadow-hard">
              <h2 className="border-b-2 border-text-main bg-primary px-4 py-3 font-heading text-xl font-bold uppercase text-white" id="team-list-heading">
                Your Teams
              </h2>
              {filteredTeams.length > 0 ? (
                <ul className="divide-y-2 divide-text-main/15">
                  {filteredTeams.map((membership) => {
                    const { team, wins, losses, draws } = membership
                    const isSelected = selectedTeam?.team.id === team.id
                    return (
                      <li key={team.id}>
                        <button
                          aria-pressed={isSelected}
                          className={`w-full px-4 py-4 text-left transition-colors hover:bg-primary/5 focus-visible:outline-offset-[-3px] ${isSelected ? 'bg-primary/10' : ''}`}
                          onClick={() => {
                            setSelectedTeamId(team.id)
                            setActionNotice('')
                            setIsTeamSettingsOpen(false)
                            setIsScheduleMatchOpen(false)
                          }}
                          type="button"
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="font-heading text-lg font-bold">{team.name}</span>
                            <span className="shrink-0 border border-text-main bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                              {membership.role === 'CoCaptain' ? 'Co-captain' : membership.role}
                            </span>
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                            <span>{team.sport}</span>
                            <span aria-hidden="true">·</span>
                            <span>{wins}-{losses}-{draws}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="p-5 text-muted">No teams match your search.</p>
              )}
            </section>

            {selectedTeam && (
              <div className="flex flex-col gap-8">
                <section aria-labelledby="team-details-heading" className="relative overflow-hidden border-2 border-text-main bg-white shadow-hard">
                  <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute -bottom-8 -right-4 hidden text-[180px] text-text-main/5 lg:block">
                    sports_baseball
                  </span>
                  <div className="relative flex flex-col gap-6 p-5 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-text-main pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 border-2 border-text-main bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          <span aria-hidden="true" className="material-symbols-outlined text-base">sports_baseball</span>
                          {selectedTeam.team.sport}
                        </span>
                        <span className="border-2 border-text-main bg-off-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                          {displayInvitePolicy(selectedTeam.team.invitePolicy)}
                        </span>
                        <span className="border-2 border-text-main bg-off-white px-2.5 py-1 text-xs font-bold uppercase">
                          Team #{selectedTeam.team.id}
                        </span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-muted">
                        Founded {formatDate(selectedTeam.team.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="font-heading text-3xl font-bold uppercase leading-tight sm:text-4xl" id="team-details-heading">
                          {selectedTeam.team.name}
                        </h2>
                        <p className="mt-2 text-muted">
                          Record: <strong className="text-text-main">{selectedTeam.wins} wins, {selectedTeam.losses} losses, {selectedTeam.draws} draws</strong>
                        </p>
                      </div>
                      {canManageTeam && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="inline-flex items-center gap-2 border-2 border-text-main bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-hard-hover transition-all hover:shadow-hard"
                            onClick={() => setActionNotice('Not connected.')}
                            type="button"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-lg">person_add</span>
                            Invite Players
                          </button>
                          {currentMembership?.role === 'Captain' && (
                            <button
                              className="inline-flex items-center gap-2 border-2 border-text-main bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide shadow-hard-hover transition-all hover:bg-off-white hover:shadow-hard"
                              onClick={() => setIsTeamSettingsOpen(true)}
                              type="button"
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-lg">settings</span>
                              Team Settings
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-2 border-2 border-text-main bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide shadow-hard-hover transition-all hover:bg-off-white hover:shadow-hard"
                            onClick={() => setIsScheduleMatchOpen(true)}
                            type="button"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-lg">event</span>
                            Schedule Match
                          </button>
                        </div>
                      )}
                    </div>
                    {actionNotice && (
                      <p className="border-2 border-text-main bg-off-white p-3 text-sm" role="status">
                        {actionNotice}
                      </p>
                    )}
                  </div>
                </section>

                {isTeamSettingsOpen && currentMembership?.role === 'Captain' && (
                  <TeamSettings
                    onClose={() => setIsTeamSettingsOpen(false)}
                    onPromoted={() => setActionNotice('Player promoted to co-captain.')}
                    teamId={selectedTeam.team.id}
                  />
                )}

                {isScheduleMatchOpen && canManageTeam && (
                  <ScheduleMatchDialog
                    onClose={() => setIsScheduleMatchOpen(false)}
                    onScheduled={(notice) => {
                      setActionNotice(notice)
                      setReloadCount((count) => count + 1)
                    }}
                    teamId={selectedTeam.team.id}
                    teamName={selectedTeam.team.name}
                  />
                )}

                <section aria-labelledby="matches-heading" className="border-2 border-text-main bg-white shadow-hard">
                  <div className="flex items-center gap-2 border-b-2 border-text-main p-4 sm:px-6">
                    <span aria-hidden="true" className="material-symbols-outlined text-primary">event</span>
                    <h2 className="font-heading text-2xl font-bold uppercase" id="matches-heading">Team Matches</h2>
                  </div>
                  {isLoadingMatches ? (
                    <p aria-live="polite" className="p-5 text-muted" role="status">Loading matches...</p>
                  ) : matchesError ? (
                    <div className="p-5">
                      <p className="font-bold text-accent" role="alert">{matchesError}</p>
                      <button
                        className="mt-3 border-2 border-text-main bg-white px-4 py-2 font-bold uppercase tracking-wide hover:bg-off-white"
                        onClick={() => setReloadCount((count) => count + 1)}
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  ) : teamMatches.length === 0 ? (
                    <p className="p-5 text-muted">No matches have been scheduled for this team.</p>
                  ) : (
                    <ul className="divide-y-2 divide-text-main/15">
                      {teamMatches.map((match) => {
                        const canRespond = !match.isChallenger &&
                          match.status === 'Pending' &&
                          canManageTeam
                        return (
                          <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={match.id}>
                            <div>
                              <p className="font-bold">
                                vs. {match.otherTeamName}
                              </p>
                              <p className="mt-1 text-sm text-muted">
                                {new Date(match.matchDate).toLocaleString()} · {match.sport}
                              </p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary">
                                {match.status}
                              </p>
                            </div>
                            {canRespond && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="border-2 border-text-main bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
                                  disabled={respondingMatchId === match.id}
                                  onClick={() => void respondToMatch(match.id, 'Accepted')}
                                  type="button"
                                >
                                  Accept
                                </button>
                                <button
                                  className="border-2 border-text-main bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-off-white disabled:opacity-60"
                                  disabled={respondingMatchId === match.id}
                                  onClick={() => void respondToMatch(match.id, 'Rejected')}
                                  type="button"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>

                <section aria-labelledby="roster-heading" className="border-2 border-text-main bg-white shadow-hard">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-text-main p-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-primary">format_list_numbered</span>
                      <h2 className="font-heading text-2xl font-bold uppercase" id="roster-heading">Team Roster</h2>
                    </div>
                    {currentMembership && (
                      <span className="text-sm font-bold uppercase tracking-wide text-primary">
                        Your role: {currentMembership.role === 'CoCaptain' ? 'Co-captain' : currentMembership.role}
                      </span>
                    )}
                  </div>
                  {isLoadingMembers ? (
                    <p aria-live="polite" className="p-5 text-muted" role="status">Loading team roster...</p>
                  ) : membersError ? (
                    <div className="p-5">
                      <p className="font-bold text-accent" role="alert">{membersError}</p>
                      <button
                        className="mt-3 border-2 border-text-main bg-white px-4 py-2 font-bold uppercase tracking-wide hover:bg-off-white"
                        onClick={() => setReloadCount((count) => count + 1)}
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  ) : teamMembers.length > 0 ? (
                    <ul className="divide-y-2 divide-text-main/15">
                      {teamMembers.map((member) => {
                        const memberName = [member.firstName, member.lastName].filter(Boolean).join(' ') || `Team member #${member.userId}`
                        const isCurrentMember = member.userId === account.AccountsTable.userId
                        return (
                          <li className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6" key={member.userId}>
                            <div>
                              <p className="flex flex-wrap items-center gap-2 font-bold">
                                {isCurrentMember ? currentMemberName : memberName}
                                {isCurrentMember && (
                                  <span className="border border-text-main bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 text-sm text-muted">Joined {formatDate(member.joinedAt)}</p>
                            </div>
                            <span className="border border-text-main bg-white px-3 py-1 text-xs font-bold uppercase">
                              {member.role === 'CoCaptain' ? 'Co-captain' : member.role}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="p-5 text-muted">No team members found.</p>
                  )}
                  {/* {currentMembership?.role === 'Member' && (
                    <p className="border-t border-text-main/15 px-5 py-3 text-sm text-muted">
                      Invite and settings controls are available only to this team’s captain and co-captain.
                    </p>
                  )} */}
                </section>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  )
}
