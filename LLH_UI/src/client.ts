import type { AppType } from '@backend/index';
import { hc } from 'hono/client';


export default hc<AppType>(SERVER_URL, {
    init: {
        credentials: "include"
    }
})