import MapView from "./MapView";

export default function MapPage() {
    return (
        <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto bg-off-white md:flex-row md:overflow-hidden">
            <aside
                aria-label="Selected location details"
                className="z-10 flex w-full shrink-0 flex-col border-b-2 border-text-main md:w-[320px] md:border-r-2 lg:w-100">

                <div className="flex flex-col p-4 sm:p-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
                    <div className="mb-6 gap-3">
                        <div>
                            <h1 className="mb-1 font-heading text-3xl font-bold leading-tight tracking-tight text-text-main">
                                Gage Park
                            </h1>
                            <p className="flex items-center gap-1 text-base font-medium text-muted">
                                <span aria-hidden="true" className="material-symbols-outlined text-lg">
                                    location_on
                                </span>
                                1000 Main St E, Hamilton
                            </p>
                        </div>
                    </div>
                    {/* TODO: put map pic here */}
                    <div
                        aria-label="Illustration of the park"
                        className="group relative mb-6 h-48 overflow-hidden border-2 border-text-main bg-green-500 shadow-hard-hover"
                        role="img">
                    </div>

                    <section aria-labelledby="sportHeading" className="mb-8">
                        <h2
                            className="mb-3 inline-block border-b-2 border-text-main pb-1 text-lg font-bold uppercase tracking-wide text-text-main"
                            id="sportHeading">
                            Sports
                        </h2>
                        <p>
                            You can play basketball
                        </p>
                    </section>

                    <button
                        className="mt-auto flex w-full items-center justify-center gap-2 border-2 border-text-main bg-primary px-6 py-4 text-lg font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard active:translate-y-1 active:shadow-none"
                        type="button">
                        <span aria-hidden="true" className="material-symbols-outlined">
                            directions
                        </span>
                        Get Directions
                    </button>
                </div>
            </aside>
            <MapView />
        </main>
    )
}