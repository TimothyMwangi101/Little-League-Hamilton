import { useState } from 'react'
import AuthForm from './AuthForm'
import Nav from '../Nav'

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <>
      <Nav />
      <main className="flex min-h-screen w-full flex-col lg:flex-row">
        <section
          className="w-full lg:w-1/2 bg-primary flex items-center justify-center p-12 lg:p-24 border-b-2 lg:border-b-0 lg:border-r-2 border-text relative overflow-hidden">
          <div className="relative z-10 text-center lg:text-left max-w-xl">
            <h2
              className="text-surface font-heading text-[48px] md:text-[64px] font-semibold leading-tight drop-shadow-[4px_4px_0px_#121413]">Hamilton Little League</h2>
            <p className="text-background-light mt-6 text-[20px] font-bold leading-relaxed">Accessible and Casual
              sports for Hamiltonians</p>
          </div>
        </section>

        <section className="relative flex min-h-screen w-full lg:w-1/2 flex-col bg-background-light justify-center items-center p-8 md:p-16 lg:p-24">
          <AuthForm isRegistering={isRegistering} onModeChange={setIsRegistering} />
        </section>
      </main>
    </>
  )
}

export default Auth;
