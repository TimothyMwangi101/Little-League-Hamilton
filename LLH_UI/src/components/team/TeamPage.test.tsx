import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamPage from './TeamPage'

const { accountGet, matchesGet, membersGet, navigate } = vi.hoisted(() => ({
  accountGet: vi.fn(),
  matchesGet: vi.fn(),
  membersGet: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('../../client', () => ({
  default: {
    account: { $get: accountGet },
    team: {
      ':teamId': {
        matches: { $get: matchesGet },
        members: { $get: membersGet },
      },
    },
  },
}))

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
}))

function response(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data }),
  }
}

function accountWithRole(role: 'Captain' | 'CoCaptain' | 'Member') {
  return {
    email: 'casey@example.com',
    AccountsTable: { firstName: 'Casey', lastName: 'Player' },
    teams: [{
      role,
      wins: 0,
      losses: 0,
      draws: 0,
      team: {
        id: 12,
        name: 'Hamilton Hawks',
        sport: 'Baseball',
        invitePolicy: 'Open',
        createdAt: '2026-01-01',
      },
    }],
  }
}

describe('TeamPage role access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accountGet.mockResolvedValue(response(accountWithRole('Member')))
    matchesGet.mockResolvedValue(response([]))
    membersGet.mockResolvedValue(response([]))
  })

  it('lets a captain open team settings and schedule a match', async () => {
    accountGet.mockResolvedValue(response(accountWithRole('Captain')))
    const user = userEvent.setup()

    render(<TeamPage />)

    await user.click(await screen.findByRole('button', { name: 'Team Settings' }))
    expect(await screen.findByRole('dialog', { name: 'Team Settings' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close team settings' }))
    await user.click(screen.getByRole('button', { name: 'Schedule Match' }))
    expect(await screen.findByRole('dialog', { name: 'Schedule a Match' })).toBeInTheDocument()
  })

  it('lets a co-captain schedule a match but not open team settings', async () => {
    accountGet.mockResolvedValue(response(accountWithRole('CoCaptain')))
    const user = userEvent.setup()

    render(<TeamPage />)

    expect(await screen.findByRole('button', { name: 'Schedule Match' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Team Settings' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Schedule Match' }))
    expect(await screen.findByRole('dialog', { name: 'Schedule a Match' })).toBeInTheDocument()
  })

  it('does not show team management actions to a member', async () => {
    render(<TeamPage />)

    await screen.findByRole('heading', { name: 'Hamilton Hawks' })
    expect(screen.queryByRole('button', { name: 'Invite Players' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Team Settings' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Schedule Match' })).not.toBeInTheDocument()
  })
})
