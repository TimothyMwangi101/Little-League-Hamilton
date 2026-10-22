import { useState } from 'react'
import AuthForm from './AuthForm'

function App() {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <main className="grid min-h-screen min-h-svh grid-cols-1 bg-[#f7f5f0] text-[#121413] min-[761px]:grid-cols-2">
      <section
        aria-label="Hamilton Little League"
        className="relative flex min-h-[220px] flex-col items-center justify-end overflow-hidden border-b-2 border-[#121413] bg-[#0f4c3a] px-7 py-[34px] text-[#f7f5f0] min-[761px]:min-h-full min-[761px]:justify-center min-[761px]:border-b-0 min-[761px]:border-r-2 min-[761px]:px-[clamp(40px,8vw,120px)] min-[761px]:py-[72px]"
      >
        <div className="relative z-10 w-full min-[761px]:max-w-[560px] max-w-[440px]">
          <p className="mb-[10px] text-[13px] font-bold leading-[1.4] tracking-[0.13em] text-[#ffc39e] uppercase min-[761px]:mb-4">
            Play your way
          </p>
          <h1 className="m-0 font-['Fraunces',Georgia,serif] text-[clamp(40px,11vw,58px)] leading-[1.04] font-semibold tracking-[-0.045em] text-white [text-shadow:4px_4px_0_#121413] min-[761px]:text-[clamp(48px,5vw,76px)]">
            Hamilton<span className="min-[761px]:hidden"> </span><br className="hidden min-[761px]:block" />Little League
          </h1>
          <p className="mt-3 max-w-[390px] text-base leading-[1.55] font-bold text-[#f7f5f0] min-[761px]:mt-7 min-[761px]:text-[clamp(18px,1.7vw,22px)]">
            Accessible and casual sports for Hamiltonians.
          </p>
          <div aria-hidden="true" className="mt-[52px] hidden gap-[10px] min-[761px]:flex">
            <span className="h-2 w-[46px] border border-[#f7f5f0] bg-[#d95204]" />
            <span className="h-2 w-[74px] border border-[#f7f5f0] bg-[#f7f5f0]" />
            <span className="h-2 w-[46px] border border-[#f7f5f0] bg-transparent" />
          </div>
        </div>
        <p className="absolute bottom-7 left-10 m-0 hidden text-[13px] text-[#f7f5f0]/[0.72] min-[761px]:block">
          A little more play. A lot more community.
        </p>
      </section>

      <section className="flex min-h-0 flex-col items-center justify-center px-7 pt-12 pb-6 min-[761px]:min-h-full min-[761px]:px-[clamp(28px,7vw,96px)] min-[761px]:pt-[72px] min-[761px]:pb-[30px]">
        <AuthForm isRegistering={isRegistering} onModeChange={setIsRegistering} />
        <p className="mt-[42px] text-center text-xs text-[#636c67] min-[761px]:mt-8">
          Hamilton Little League · Made for everyone
        </p>
      </section>
    </main>
  )
}

export default App
