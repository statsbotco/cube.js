/**
 * @title @cubejs-client/ws-transport
 * @permalink /@cubejs-client-ws-transport
 * @menuCategory Cube.js Frontend
 * @subcategory Reference
 * @menuOrder 5
 * @description WebSocket transport for Cube.js client
 */

/**
 * @todo This d.ts file was copy/pasted from dist folder (original one is generated by TypeScript)
 * There is a limitation inside docs-gen, it requires that module must be wrapped inside declare module statement
 * In the feature we should support doing it without declare module, but for now I didnt find how to do it
 */

declare module '@cubejs-client/ws-transport' {
    import type { ITransport, ITransportResponse } from '@cubejs-client/core';
    class WebSocketTransportResult {
        protected readonly status: unknown;
        protected readonly result: unknown;
        constructor({ status, message }: {
            status: unknown;
            message: unknown;
        });
        json(): Promise<unknown>;
    }
    type WebSocketTransportOptions = {
        authorization?: string;
        apiUrl: string;
        // @deprecated
        hearBeatInterval?: number;
        heartBeatInterval?: number;
    };
    type Message = {
        messageId: number;
        requestId: any;
        method: string;
        params: Record<string, unknown>;
    };
    type Subscription = {
        message: Message;
        callback: (result: WebSocketTransportResult) => void;
    };
    class WebSocketTransport implements ITransport<WebSocketTransportResult> {
        protected readonly apiUrl: string;
        protected readonly heartBeatInterval: number;
        protected token: string | undefined;
        protected ws: any;
        protected messageCounter: number;
        protected messageIdToSubscription: Record<number, Subscription>;
        protected messageQueue: Message[];
        constructor({ authorization, apiUrl, heartBeatInterval, hearBeatInterval }: WebSocketTransportOptions);
        set authorization(token: string | undefined);
        close(): Promise<void>;
        get authorization(): string | undefined;
        protected initSocket(): any;
        protected sendMessage(message: any): void;
        request(method: string, { baseRequestId, ...params }: Record<string, unknown>): ITransportResponse<WebSocketTransportResult>;
    }
    export default WebSocketTransport;
}
