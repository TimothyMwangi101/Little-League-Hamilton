import * as schema from "./schemas.ts";
import { defineRelations } from "drizzle-orm";


// https://orm.drizzle.team/docs/sqlite/relations 

export const relations = defineRelations(schema, r => ({
    UsersTable: {
        account: r.one.AccountsTable({
            from: r.UsersTable.id,
            to: r.AccountsTable.userId
        }),     // one to one
    },
    AccountsTable: {
        teamDetails: r.one.TeamsTable({
            from: r.AccountsTable.team,
            to: r.TeamsTable.id
        }),
    },
    TeamsTable: {
        accounts: r.many.AccountsTable({
            from: r.TeamsTable.id,
            to: r.AccountsTable.team
        }),
        challengedMatches: r.many.MatchesTable({
            from: r.TeamsTable.id,
            to: r.MatchesTable.challengerId,
            alias: "challenger"
        }),
        opponentMatches: r.many.MatchesTable({
            from: r.TeamsTable.id,
            to: r.MatchesTable.opponentId,
            alias: "opponent"
        }),
    },
    MatchesTable: {
        challenger: r.one.TeamsTable({
            from: r.MatchesTable.challengerId,
            to: r.TeamsTable.id,
            alias: "challenger"
        }),
        opponent: r.one.TeamsTable({
            from: r.MatchesTable.opponentId,
            to: r.TeamsTable.id,
            alias: "opponent"
        }),
    }
}));