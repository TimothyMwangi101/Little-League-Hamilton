import { useState } from 'react'
import AuthForm from './AuthForm'

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <>
      <main className="grid grid-cols-2 h-dvh">
        <section className="flex items-center justify-center bg-auth-green lg:p-24">
          <div className="text-center lg:text-left">
            <h2 className="font-heading font-semibold leading-tight text-surface drop-shadow-hard md:text-[64px]">
              Hamilton Little League
            </h2>
            <p className="mt-6 text-[20px] font-bold leading-relaxed text-background-light">
              Accessible and Casual sports for Hamiltonians
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <AuthForm isRegistering={isRegistering} onModeChange={setIsRegistering} />
        </section>
      </main>
    </>
  )
}

export default Auth;
