import { type SafeAccount } from "@backend/db/schemas"


export default function Account({ ...account }: SafeAccount) {
    const stats = [
        { label: "Goals", value: account.goals, icon: "sports_soccer" },
        { label: "Assists", value: account.assists, icon: "handshake" },
        { label: "Wins", value: account.wins, icon: "emoji_events" },
        { label: "Losses", value: account.losses, icon: "sentiment_dissatisfied" },
    ]

    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
            <div className="mb-8 border-b-4 border-text-main pb-5">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
                    Hamilton Little League
                </p>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-text-main sm:text-4xl">
                    My Account
                </h1>
                <p className="mt-2 text-lg text-muted">Your player profile and league activity</p>
            </div>

            <section aria-labelledby="profile-heading" className="mb-8 border-2 border-text-main bg-surface p-5 shadow-hard sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center border-2 border-text-main bg-primary text-white shadow-hard">
                            <span className="material-symbols-outlined text-3xl">person</span>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted">
                                Player profile
                            </p>
                            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="profile-heading">
                                League Member
                            </h2>
                        </div>
                    </div>
                    <div className="border-t-2 border-text-main pt-4 sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
                        <p className="text-sm font-bold uppercase tracking-wider text-muted">Member since</p>
                        <p className="mt-1 text-lg font-bold text-text-main">
                            {`${account.createdAt}`}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 border-t-2 border-text-main pt-5 sm:grid-cols-2">
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
                                {account.teams.length} {account.teams.length === 1 ? "team" : "teams"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="stats-heading" className="mb-8">
                <div className="mb-4 flex items-end justify-between border-b-2 border-text-main pb-2">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="stats-heading">
                        League stats
                    </h2>
                    <span className="text-sm font-bold uppercase tracking-wide text-muted">Career totals</span>
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
                        <p className="mt-1 text-muted">Your selected sports</p>
                    </div>
                    <div className="flex flex-wrap gap-3 p-5">
                        {account.prefers.length > 0 ? (
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
                            My teams
                        </h2>
                        <p className="mt-1 text-muted">Teams linked to your account</p>
                    </div>
                    {account.teams.length > 0 ? (
                        <ul className="divide-y-2 divide-text-main px-5">
                            {account.teams.map((team) => (
                                <li className="flex items-center gap-3 py-4" key={team}>
                                    <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">
                                        groups
                                    </span>
                                    <span className="font-bold text-text-main">{team}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-5 text-muted">You are not on a team yet.</p>
                    )}
                </section>
            </div>
        </main>
    )
}
