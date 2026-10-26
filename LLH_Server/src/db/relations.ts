import * as schema from "./schemas.ts";
import { defineRelations } from "drizzle-orm";


// https://orm.drizzle.team/docs/sqlite/relations 

export const relations = defineRelations(schema, r => ({
    UsersTable: {
        apiKeys: r.one.AccountsTable({
            from: r.UsersTable.id,
            to: r.AccountsTable.userId
        }),     // one to one
    }
}));