import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Account as AccountData, ApiResponse } from '@backend/db/schemas'
import Account from './Account.tsx'

type AccountProfile = AccountData & { email: string }

export default function AccountPage() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<AccountProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadAccount() {
      try {
        const response = await fetch('/api/account', { credentials: 'same-origin' })
        const result: ApiResponse<AccountProfile> = await response.json()

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (!response.ok || 'error' in result) {
          throw new Error('error' in result ? result.error : 'Unable to load your account.')
        }

        if (isCurrent) {
          setAccount(result.data)
        }
      } catch (err) {
        console.error(err)
        if (isCurrent) {
          setError('Unable to load your account. Please try again.')
        }
      }
    }

    void loadAccount()
    return () => {
      isCurrent = false
    }
  }, [navigate])

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
        <p role="alert" className="font-bold text-accent">{error}</p>
      </main>
    )
  }

  if (!account) {
    return (
      <main aria-busy="true" className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
        <p role="status" className="text-muted">Loading your account...</p>
      </main>
    )
  }

  return <Account {...account} />
}
