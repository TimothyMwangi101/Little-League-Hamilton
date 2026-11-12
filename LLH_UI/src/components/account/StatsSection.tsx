import type { Account } from "./AccountPage"

type StatsSectionProps = {
    account: Account["AccountsTable"]
}

export default function StatsSection({ account }: StatsSectionProps) {
    const stats = [
        { label: "Goals", value: account.goals, icon: "sports_soccer" },
        { label: "Assists", value: account.assists, icon: "handshake" },
        { label: "Wins", value: account.wins, icon: "emoji_events" },
        { label: "Losses", value: account.losses, icon: "sentiment_dissatisfied" },
    ]

    return (
        <section aria-labelledby="stats-heading" className="mb-8">
            <div className="mb-4 border-b-2 border-text-main pb-2">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="stats-heading">
                    League stats
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(({ label, value, icon }) => (
                    <article className="border-2 border-text-main bg-surface p-4 shadow-hard sm:p-5" key={label}>
                        <div className="mb-5 flex items-center justify-between">
                            <p className="font-bold uppercase tracking-wide text-muted">{label}</p>
                            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                        </div>
                        <p className="font-heading text-4xl font-bold text-text-main">{value}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
