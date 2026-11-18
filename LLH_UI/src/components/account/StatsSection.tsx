import type { Account } from "./AccountPage"

type StatsSectionProps = {
    teams: Account["teams"]
}

export default function StatsSection({ teams }: StatsSectionProps) {
    const record = teams.reduce(
        (total, membership) => ({
            wins: total.wins + membership.wins,
            losses: total.losses + membership.losses,
            draws: total.draws + membership.draws,
        }),
        { wins: 0, losses: 0, draws: 0 },
    )
    const stats = [
        { label: "Wins", value: record.wins, icon: "emoji_events" },
        { label: "Losses", value: record.losses, icon: "sentiment_dissatisfied" },
        { label: "Draws", value: record.draws, icon: "handshake" },
    ]

    return (
        <section aria-labelledby="stats-heading" className="mb-8">
            <div className="mb-4 border-b-2 border-text-main pb-2">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main sm:text-3xl" id="stats-heading">
                    Combined team records
                </h2>
                <p className="mt-1 text-sm text-muted">Totals across the teams you belong to.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
