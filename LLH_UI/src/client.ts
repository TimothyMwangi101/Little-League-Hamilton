import type { AppType } from '@server/app';
import { hc } from 'hono/client';


export default hc<AppType>(`${window.location.origin}/api`, {
    init: {
        credentials: "include"
    }
})