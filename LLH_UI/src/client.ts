import type { AppType } from '@server/app';
import { hc } from 'hono/client';


export default hc<AppType>(SERVER_URL, {
    init: {
        credentials: "include"
    }
})