import { Link, NavLink } from 'react-router'

const links = [
  { label: 'Dashboard', to: '/', icon: 'dashboard' },
  { label: 'Map', to: '/map', icon: 'location_on' },
  { label: 'Search', to: '/search', icon: 'search' },
  { label: 'Login', to: '/auth', icon: 'person' },
] as const

function Nav() {
  return (
    <header className="bg-surface border-b-2">
      <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between h-20">
        <Link
          aria-label="Hamilton Little League home"
          className="flex min-w-0 items-center gap-2 min-[761px]:gap-4"
          to="/"
        >
          <span className="flex size-9 shrink-0 items-center justify-center border-2 border-text-main bg-primary text-white shadow-hard min-[761px]:size-10">
            <span aria-hidden="true" className="material-symbols-outlined text-xl">
              sports_score
            </span>
          </span>
          <h1 className="hidden truncate font-heading min-[480px]:block text-xl font-bold uppercase">
            Hamilton Little League
          </h1>
        </Link>

        <nav aria-label="Main navigation" className="flex h-full">
          {links.map(({ label, to, icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex h-full min-w-10 items-center justify-center gap-2 border-b-4 px-2 text-[#121413] transition-colors hover:bg-gray-50 min-[761px]:px-6 ${isActive
                  ? 'border-[#d95204] bg-[#d95204]/5 text-[#d95204]'
                  : 'border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined shrink-0 text-[20px]"
                    style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    {icon}
                  </span>
                  <span className="sr-only text-base font-bold tracking-wide uppercase min-[761px]:not-sr-only">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Nav;
