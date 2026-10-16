import * as schema from "./schemas.ts";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema);