import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AccountView from './Account.tsx'
import type { InferResponseType } from "hono/client";
import { StatusCodes } from "http-status-codes";
import client from "../../client";

export type Account = InferResponseType<typeof client.account.$get, StatusCodes.OK>["data"];

export default function AccountPage() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<Account>()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let isCurrent = true

    async function loadAccount() {
      try {
        const response = await client.account.$get();

        if (response.status == StatusCodes.UNAUTHORIZED) {
          await navigate('/login', { replace: true })
          return
        }
        const result = await response.json();

        if ('error' in result) {
          setError(String(result.error))
          return
        }

        if (isCurrent) 
          setAccount(result.data)
        
      } catch (err) {
        console.error(err)
        if (isCurrent) 
          setError('Unable to load your account. Please try again.')
        
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

  return <AccountView account={account.AccountsTable} email={account.email} />
}
