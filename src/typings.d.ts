import * as distypecmd from '@distype/cmd'; // eslint-disable-line @typescript-eslint/no-unused-vars

declare module '@distype/cmd/dist/middleware' { // eslint-disable-line quotes
    interface MiddlewareMeta {
        fail?: boolean
    }
}
