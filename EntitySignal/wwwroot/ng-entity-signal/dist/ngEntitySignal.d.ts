/// <reference types="angular" />
declare namespace EntitySignal {
    enum EntityState {
        Detached = 0,
        Unchanged = 1,
        Deleted = 2,
        Modified = 3,
        Added = 4
    }
    interface DataContainer<T> {
        type: string;
        id: string;
        object: T;
        state: EntityState;
    }
    interface UserResult {
        connectionId: string;
        urls: UserUrlResult[];
    }
    interface UserUrlResult {
        url: string;
        data: DataContainer<any>[];
    }
    enum EntitySignalStatus {
        Disconnected = 0,
        Connecting = 1,
        Connected = 2,
        WaitingForConnectionId = 3
    }
    interface SyncSubscription {
        [key: string]: any[];
    }
    interface PendingHardRefreshes {
        [key: string]: Promise<any>;
    }
    interface EntitySignalOptions {
        autoreconnect: boolean;
        reconnectMinTime: number;
        reconnectVariance: number;
        debug: boolean;
        suppressInternalDataProcessing: boolean;
        hubUrl: string;
        maxWaitForConnectionId: number;
        returnDeepCopy: boolean;
        defaultId: string;
        defaultIdAlt: string;
        spliceModifications: boolean;
    }
    type OnStatusChangedCallback = (status: EntitySignalStatus) => void;
    type OnSyncCallback = (newData: UserResult) => void;
    type OnUrlDataChangeCallback = (urlData: any) => void;
    class Client {
        subscriptions: SyncSubscription;
        pendingHardRefreshes: PendingHardRefreshes;
        hub: any;
        options: EntitySignalOptions;
        private connectingDefer;
        connectionId: string;
        private onStatusChangeCallbacks;
        private onSyncCallbacks;
        private onUrlCallbacks;
        private _status;
        status: EntitySignalStatus;
        constructor(options?: EntitySignalOptions);
        onDataChange(url: string, callback: OnUrlDataChangeCallback): OnUrlDataChangeCallback;
        offDataChange(url: string, callback: OnUrlDataChangeCallback): void;
        onStatusChange(callback: OnStatusChangedCallback): OnStatusChangedCallback;
        offStatusChange(callback: OnStatusChangedCallback): void;
        onSync(callback: OnSyncCallback): OnSyncCallback;
        offSync(callback: OnSyncCallback): void;
        private onClose;
        debugPrint(output: string): void;
        connect(): Promise<void>;
        reconnect(): void;
        processSync(data: UserResult): string[];
        desyncFrom(url: string): Promise<void>;
        hardRefresh(url: string): Promise<any>;
        syncWith(url: string): Promise<any>;
    }
}
interface ngEntitySignal {
    syncWith(url: string): ng.IPromise<any>;
    hardRefresh(url: string): ng.IPromise<any>;
    desyncFrom(url: string): ng.IPromise<any>;
    client: EntitySignal.Client;
    status: EntitySignal.EntitySignalStatus;
}
