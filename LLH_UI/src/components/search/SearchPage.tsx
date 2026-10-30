import { useMemo, useState } from 'react'
const sports = ['Basketball', 'Baseball', 'Football', 'Soccer', 'Bocce', 'Tennis'] as const
const regions = ['Hamilton Mountain', 'Lower Hamilton'] as const

type Sport = (typeof sports)[number]
type Region = (typeof regions)[number]

type Team = {
  id: number
  name: string
  sport: Sport
  captain: string
  region: Region
  open: boolean
}

const teams: Team[] = [
  { id: 1, name: 'Mountain Hoopsters', sport: 'Basketball', captain: 'Sarah J.', region: 'Lower Hamilton', open: true },
  { id: 2, name: 'The Backboard Breakers', sport: 'Basketball', captain: 'Mike T.', region: 'Lower Hamilton', open: true },
  { id: 3, name: 'Escarpment Elite', sport: 'Basketball', captain: 'Alex W.', region: 'Lower Hamilton', open: true },
  { id: 4, name: 'Concession Cruisers', sport: 'Basketball', captain: 'David L.', region: 'Lower Hamilton', open: false },
]

function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedSports, setSelectedSports] = useState<Sport[]>(['Basketball'])
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(['Lower Hamilton'])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return teams.filter((team) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        team.name.toLowerCase().includes(normalizedQuery) ||
        team.captain.toLowerCase().includes(normalizedQuery)
      const matchesSport = selectedSports.length === 0 || selectedSports.includes(team.sport)
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(team.region)

      return matchesQuery && matchesSport && matchesRegion
    })
  }, [query, selectedRegions, selectedSports])

  function toggleSport(sport: Sport) {
    setSelectedSports((current) =>
      current.includes(sport) ? current.filter((item) => item !== sport) : [...current, sport],
    )
  }

  function toggleRegion(region: Region) {
    setSelectedRegions((current) =>
      current.includes(region) ? current.filter((item) => item !== region) : [...current, region],
    )
  }

  function clearFilters() {
    setQuery('')
    setSelectedSports([])
    setSelectedRegions([])
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
              Sport
            </legend>
            <div className="space-y-4">
              {sports.map((sport) => (
                <label className="group flex cursor-pointer items-center gap-3" key={sport}>
                  <input
                    checked={selectedSports.includes(sport)}
                    className="size-6 cursor-pointer appearance-none border-2 border-text-main bg-white checked:bg-primary checked:before:block checked:before:text-center checked:before:text-lg checked:before:font-bold checked:before:text-white checked:before:content-['✓']"
                    onChange={() => toggleSport(sport)}
                    type="checkbox"
                  />
                  <span className="text-lg group-hover:font-bold">{sport}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 w-full border-b-2 border-text-main pb-2 text-xl font-bold">
              Region
            </legend>
            <div className="space-y-4">
              {regions.map((region) => (
                <label className="group flex cursor-pointer items-center gap-3" key={region}>
                  <input
                    checked={selectedRegions.includes(region)}
                    className="size-6 cursor-pointer appearance-none border-2 border-text-main bg-white checked:bg-primary checked:before:block checked:before:text-center checked:before:text-lg checked:before:font-bold checked:before:text-white checked:before:content-['✓']"
                    onChange={() => toggleRegion(region)}
                    type="checkbox"
                  />
                  <span className="text-lg group-hover:font-bold">{region}</span>
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

          {(selectedSports.length > 0 || selectedRegions.length > 0) && (
            <div aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
              {selectedSports.map((sport) => (
                <button
                  aria-label={`Remove ${sport} filter`}
                  className="flex items-center gap-2 border-2 border-text-main bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-accent"
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  type="button"
                >
                  {sport}
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              ))}
              {selectedRegions.map((region) => (
                <button
                  aria-label={`Remove ${region} filter`}
                  className="flex items-center gap-2 border-2 border-text-main bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-accent"
                  key={region}
                  onClick={() => toggleRegion(region)}
                  type="button"
                >
                  {region}
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
            Results ({filteredTeams.length})
          </h2>
        </div>

        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <article
                className="flex h-full flex-col justify-between border-2 border-text-main bg-white p-6 transition-shadow hover:shadow-hard"
                key={team.id}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span className="border-2 border-text-main bg-accent px-2 py-1 text-sm font-bold uppercase tracking-wider text-white">
                      {team.sport}
                    </span>
                    <span
                      className={`flex items-center gap-1 font-bold ${team.open ? 'text-primary' : 'text-muted'}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-xl">
                        {team.open ? 'person' : 'lock'}
                      </span>
                      {team.open ? 'Open' : 'Invite Only'}
                    </span>
                  </div>
                  <h3 className="mb-2 font-heading text-2xl font-bold leading-tight">{team.name}</h3>
                  <div className="mb-6 space-y-2 border-t-2 border-dashed border-muted pt-4">
                    <p className="text-base">
                      <strong>Captain:</strong> {team.captain}
                    </p>
                    <p className="text-base">
                      <strong>Region:</strong> {team.region}
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

export default SearchPage
