import { useCallback, useEffect, useState } from "react";
import { invitePolicies, sports, type Sport } from "@shared/types";
import client from "../../client";
import type { InferResponseType } from "hono/client";
import type { StatusCodes } from "http-status-codes";
import { teamSearchValidator } from "@shared/validators";
import type z from "zod";

type TeamsResponse = InferResponseType<
  typeof client.teams.$get,
  StatusCodes.OK
>;
type TeamData = TeamsResponse["data"];
type InvitePolicy = TeamData[number]["team"]["invitePolicy"];
type TeamSearch = z.infer<typeof teamSearchValidator>;

function readUrl(): TeamSearch {
  const parsed = teamSearchValidator.safeParse(
    Object.fromEntries(new URLSearchParams(location.search)),
  );
  return parsed.success ? parsed.data : teamSearchValidator.parse({});
}

function toSearchString({
  page,
  search,
  sports,
  invitePolicies,
}: TeamSearch) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  if (search) p.set("search", search);
  if (sports.length) p.set("sports", sports.join(","));
  if (invitePolicies.length) p.set("invitePolicies", invitePolicies.join(","));
  return p.toString().replaceAll("%2C", ",");
}

export function useTeamSearchUrl() {
  const [params, setParams] = useState(readUrl);

  useEffect(() => {
    const sync = () => setParams(readUrl());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const update = useCallback((patch: Partial<TeamSearch>, replace = false) => {
    const next = { ...readUrl(), page: 1, ...patch };
    const qs = toSearchString(next);
    history[replace ? "replaceState" : "pushState"](
      null,
      "",
      location.pathname + (qs ? `?${qs}` : ""),
    );
    setParams(next);
  }, []);

  return [params, update] as const;
}

export default function SearchPage() {
  const [params, update] = useTeamSearchUrl();
  const {
    page,
    search = "",
    sports: selectedSports,
    invitePolicies: selectedInvitePolicies,
  } = params;

  const [teams, setTeams] = useState<TeamData>([]);
  const [pagination, setPagination] = useState<TeamsResponse["pagination"]>({
    page: 1,
    pageSize: 6,
    total: 0,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadTeams() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await client.teams.$get({
          query: {
            page: String(page),
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(selectedSports.length ? { sports: selectedSports.join(",") } : {}),
            ...(selectedInvitePolicies.length
              ? { invitePolicies: selectedInvitePolicies.join(",") }
              : {}),
          },
        });
        const result = await response.json();

        if (!response.ok || "error" in result) {
          throw new Error(
            "error" in result ? String(result.error) : "Unable to load teams.",
          );
        }

        if (isCurrent) {
          setTeams(result.data);
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error(error);
        if (isCurrent) setLoadError("Unable to load teams. Please try again.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadTeams();
    return () => {
      isCurrent = false;
    };
  }, [
    page,
    search,
    reloadCount,
    selectedInvitePolicies,
    selectedSports,
  ]);

  function toggleInvitePolicy(invitePolicy: InvitePolicy) {
    update({
      invitePolicies: selectedInvitePolicies.includes(invitePolicy)
        ? selectedInvitePolicies.filter((item) => item !== invitePolicy)
        : [...selectedInvitePolicies, invitePolicy],
    });
  }

  function toggleSport(sport: Sport) {
    update({
      sports: selectedSports.includes(sport)
        ? selectedSports.filter((item) => item !== sport)
        : [...selectedSports, sport],
    });
  }

  function clearFilters() {
    update({ search: "", sports: [], invitePolicies: [] });
  }

  function renderFilters() {
    return (
      <>
        <div className="mb-8 flex items-center justify-between gap-2">
          <h1 className="font-heading text-3xl font-bold leading-tight">
            Filters
          </h1>
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
              Team access
            </legend>
            <div className="space-y-4">
              {invitePolicies.map((invitePolicy) => (
                <label
                  className="group flex cursor-pointer items-center gap-3"
                  key={invitePolicy}
                >
                  <input
                    checked={selectedInvitePolicies.includes(invitePolicy)}
                    className="size-6 cursor-pointer appearance-none border-2 border-text-main bg-white checked:bg-primary checked:before:block checked:before:text-center checked:before:text-lg checked:before:font-bold checked:before:text-white checked:before:content-['✓']"
                    onChange={() => toggleInvitePolicy(invitePolicy)}
                    type="checkbox"
                  />
                  <span className="text-lg group-hover:font-bold">
                    {invitePolicy === "Open" ? "Open" : "Invite Only"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 w-full border-b-2 border-text-main pb-2 text-xl font-bold">
              Sport
            </legend>
            <div className="space-y-4">
              {sports.map((sport) => (
                <label
                  className="group flex cursor-pointer items-center gap-3"
                  key={sport}
                >
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
        </div>
      </>
    );
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
              {showMobileFilters ? "expand_less" : "tune"}
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
            event.preventDefault();
          }}
          role="search"
        >
          <label className="sr-only" htmlFor="team-search">
            Search teams or sports
          </label>
          <div className="relative flex items-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined absolute left-4 text-3xl"
            >
              search
            </span>
            <input
              className="h-16 w-full border-2 border-text-main bg-off-white py-3 pl-14 pr-28 text-lg placeholder:text-muted focus:outline-none focus:shadow-hard"
              id="team-search"
              onChange={(event) => update({ search: event.target.value }, true)}
              placeholder="Search teams or sports..."
              type="search"
              value={search}
            />
          </div>

          {(selectedInvitePolicies.length > 0 || selectedSports.length > 0) && (
            <div
              aria-label="Active filters"
              className="mt-4 flex flex-wrap gap-2"
            >
              {selectedInvitePolicies.map((invitePolicy) => (
                <button
                  aria-label={`Remove ${invitePolicy === "Open" ? "Open" : "Invite Only"} filter`}
                  className="flex items-center gap-2 border-2 border-text-main bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-accent"
                  key={invitePolicy}
                  onClick={() => toggleInvitePolicy(invitePolicy)}
                  type="button"
                >
                  {invitePolicy === "Open" ? "Open" : "Invite Only"}
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-base"
                  >
                    close
                  </span>
                </button>
              ))}
              {selectedSports.map((sport) => (
                <button
                  aria-label={`Remove ${sport} filter`}
                  className="flex items-center gap-2 border-2 border-text-main bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-accent"
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  type="button"
                >
                  {sport}
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-base"
                  >
                    close
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="mb-6">
          <h2 aria-live="polite" className="font-heading text-2xl font-bold">
            Results ({isLoading || loadError ? 0 : pagination.total})
          </h2>
        </div>

        {isLoading ? (
          <p
            aria-live="polite"
            className="border-2 border-text-main bg-off-white p-8 text-center"
          >
            Loading teams...
          </p>
        ) : loadError ? (
          <div className="border-2 border-text-main bg-off-white p-8 text-center">
            <p className="font-bold" role="alert">
              {loadError}
            </p>
            <button
              className="mt-4 border-2 border-text-main bg-primary px-6 py-3 font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:shadow-hard-hover"
              onClick={() => setReloadCount((count) => count + 1)}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const captainName = [
                team.captain?.firstName,
                team.captain?.lastName,
              ]
                .filter((name): name is string => name != null)
                .join(" ");

              return (
                <article
                  className="flex h-full flex-col justify-between border-2 border-text-main bg-white p-6 transition-shadow hover:shadow-hard"
                  key={team.team.id}
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <span
                        className={`flex items-center gap-1 font-bold ${team.team.invitePolicy === "Open" ? "text-primary" : "text-muted"}`}
                      >
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-xl"
                        >
                          {team.team.invitePolicy === "Open"
                            ? "person"
                            : "lock"}
                        </span>
                        {team.team.invitePolicy === "Open"
                          ? "Open"
                          : "Invite Only"}
                      </span>
                    </div>
                    <h3 className="mb-2 font-heading text-2xl font-bold leading-tight">
                      {team.team.name}
                    </h3>
                    <div className="mb-6 space-y-2 border-t-2 border-dashed border-muted pt-4">
                      <p className="text-base">
                        <strong>Sport:</strong> {team.team.sport}
                      </p>
                      <p className="text-base">
                        <strong>Record:</strong> {team.wins}-{team.losses}-
                        {team.draws}
                      </p>
                      {captainName && (
                        <p className="text-base">
                          <strong>Captain:</strong> {captainName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="border-2 border-text-main bg-off-white py-3 text-center font-bold uppercase tracking-wider">
                    Team #{team.team.id}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-text-main bg-off-white p-8 text-center">
            <h3 className="font-heading text-xl font-bold">No teams found</h3>
            <p className="mt-2 text-muted">
              Try another search or clear your filters.
            </p>
          </div>
        )}
        {!isLoading && !loadError && pagination.total > pagination.pageSize && (
          <nav
            aria-label="Team search pagination"
            className="mb-8 flex items-center justify-center gap-4"
          >
            <button
              className="border-2 border-text-main bg-off-white px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 }, true)}
              type="button"
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              className="border-2 border-text-main bg-off-white px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                page >= Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => update({ page: page + 1 }, true)}
              type="button"
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
