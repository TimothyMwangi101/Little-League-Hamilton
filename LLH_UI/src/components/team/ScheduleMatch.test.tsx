import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScheduleMatch from './ScheduleMatch'

const { scheduleMatchPost } = vi.hoisted(() => ({
  scheduleMatchPost: vi.fn(),
}))

vi.mock('../../client', () => ({
  default: {
    team: {
      ':teamId': {
        matches: { $post: scheduleMatchPost },
      },
    },
  },
}))

function response(result: unknown, ok = true) {
  return {
    ok,
    json: async () => result,
  }
}

function futureDateTime() {
  const date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

describe('ScheduleMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields before making the request', async () => {
    const user = userEvent.setup()

    render(<ScheduleMatch teamId={12} teamName="Hamilton Hawks" onClose={vi.fn()} onScheduled={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Schedule Match' }))

    expect(await screen.findByText('Too small: expected string to have >=1 characters')).toBeInTheDocument()
    expect(await screen.findByText('Invalid ISO datetime')).toBeInTheDocument()
    expect(scheduleMatchPost).not.toHaveBeenCalled()
  })

  it('submits the team, opponent, and date and closes after success', async () => {
    const onClose = vi.fn()
    const onScheduled = vi.fn()
    const user = userEvent.setup()
    const matchDate = futureDateTime()
    scheduleMatchPost.mockResolvedValue(response({ data: { id: 99 } }))

    render(<ScheduleMatch teamId={12} teamName="Hamilton Hawks" onClose={onClose} onScheduled={onScheduled} />)

    await user.type(screen.getByLabelText('Opposing team name'), 'Hamilton Tigers')
    await user.type(screen.getByLabelText('Match date and time'), matchDate)
    await user.click(screen.getByRole('button', { name: 'Schedule Match' }))

    expect(await screen.findByRole('dialog', { name: 'Schedule a Match' })).toBeInTheDocument()
    expect(scheduleMatchPost).toHaveBeenCalledWith({
      param: { teamId: '12' },
      json: {
        opponentTeamName: 'Hamilton Tigers',
        matchDate: new Date(matchDate).toISOString(),
      },
    })
    expect(onScheduled).toHaveBeenCalledWith(
      'Match scheduled with Hamilton Tigers. The opposing team has been notified.',
    )
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows the server error and leaves the dialog open when scheduling fails', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    scheduleMatchPost.mockResolvedValue(response({ error: 'That opponent could not be found.' }, false))

    render(<ScheduleMatch teamId={12} teamName="Hamilton Hawks" onClose={onClose} onScheduled={vi.fn()} />)

    await user.type(screen.getByLabelText('Opposing team name'), 'Hamilton Tigers')
    await user.type(screen.getByLabelText('Match date and time'), futureDateTime())
    await user.click(screen.getByRole('button', { name: 'Schedule Match' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That opponent could not be found.')
    expect(onClose).not.toHaveBeenCalled()
  })
})
