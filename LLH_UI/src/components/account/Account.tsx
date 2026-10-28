import type { Account as AccountData } from '@backend/db/schemas'

type AccountProfile = AccountData

export default function Account({ ...account }: AccountProfile) {
    const greetingName = [account.firstName, account.lastName]
        .filter((name) => name?.trim())
        .join(' ') || "Hey there"
    const stats = [
        { label: "Goals", value: account.goals, icon: "sports_soccer" },
        { label: "Assists", value: account.assists, icon: "handshake" },
        { label: "Wins", value: account.wins, icon: "emoji_events" },
        { label: "Losses", value: account.losses, icon: "sentiment_dissatisfied" },
    ]


    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
            <section aria-labelledby="profile-heading" className="grid gap-6 lg:grid-cols-2 mb-6">
                <div className="flex items-center">
                    <div className="flex items-center gap-4">
                        <div aria-hidden="true" className="flex size-48 shrink-0 items-center justify-center border-2 border-text-main bg-primary text-white shadow-hard">
                            <span className="material-symbols-outlined text-9xl">person</span>
                        </div>
                        <div className='text-center'>
                            <h2 className="font-heading text-2xl font-bold uppercase text-center text-primary sm:text-3xl" id="profile-heading">
                                {greetingName}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="border-2 border-text-main bg-surface p-5 shadow-hard sm:p-7">
                    <div className="grid h-full content-center gap-5 border-text-main sm:grid-cols-2 xl:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">
                                location_on
                            </span>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted">Region</p>
                                <p className="mt-1 font-bold text-text-main">
                                    {account.region ?? "No region selected"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">
                                groups
                            </span>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted">Teams</p>
                                <p className="mt-1 font-bold text-text-main">
                                    No team
                                    {/* FIXME: ?? */}
                                    {/* {account.teams.length} {account.teams.length === 1 ? "team" : "teams"} */}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">
                                calendar_month
                            </span>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted">Member since</p>
                                <p className="mt-1 font-bold text-text-main">{account.createdAt}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="stats-heading" className="mb-8">
                <div className="mb-4 flex items-end justify-between border-b-2 border-text-main pb-2">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="stats-heading">
                        League stats
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map(({ label, value, icon }) => (
                        <article className="border-2 border-text-main bg-surface p-4 shadow-hard sm:p-5" key={label}>
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-bold uppercase tracking-wide text-muted">{label}</p>
                                <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">
                                    {icon}
                                </span>
                            </div>
                            <p className="font-heading text-4xl font-bold text-text-main">{value}</p>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
                <section aria-labelledby="sports-heading" className="border-2 border-text-main bg-surface shadow-hard">
                    <div className="border-b-2 border-text-main bg-background-light p-5">
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="sports-heading">
                            Sports I play
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-3 p-5">
                        {account.prefers && account.prefers.length > 0 ? (
                            account.prefers.map((sport) => (
                                <span className="border-2 border-text-main bg-primary px-4 py-2 font-bold uppercase tracking-wide text-white" key={sport}>
                                    {sport}
                                </span>
                            ))
                        ) : (
                            <p className="text-muted">No sports selected yet.</p>
                        )}
                    </div>
                </section>

                <section aria-labelledby="teams-heading" className="border-2 border-text-main bg-surface shadow-hard">
                    <div className="border-b-2 border-text-main bg-background-light p-5">
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main" id="teams-heading">
                            My team
                        </h2>
                    </div>
                    {account.team && account.team > 0 ? (
                        <p>You are in a team</p>
                    ) : (
                        <p className="p-5 text-muted">You are not on a team yet.</p>
                    )}
                </section>
            </div>
        </main>
    )
}
