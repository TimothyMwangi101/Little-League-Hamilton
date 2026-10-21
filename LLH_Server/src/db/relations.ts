import * as schema from "./schemas.ts";
import { defineRelations } from "drizzle-orm";


// https://orm.drizzle.team/docs/sqlite/relations 

export const relations = defineRelations(schema, r => ({
    ApiKeysTable: {
        user: r.one.UsersTable({
            from: r.ApiKeysTable.userId,
            to: r.UsersTable.id
        }),     // one to one
    },
    UsersTable: {
        apiKeys: r.many.ApiKeysTable(),     // one to many
    }
}));