namespace EntitySignal {
  export enum EntityState {
    Detached = 0,
    Unchanged = 1,
    Deleted = 2,
    Modified = 3,
    Added = 4
  };

  interface DataContainer<T> {
    type: string;
    id: string;
    object: T;
    state: EntityState;
  }

  export interface UserResult {
    connectionId: string;
    urls: UserUrlResult[];
  }

  interface UserUrlResult {
    url: string;
    data: DataContainer<any>[];
  }

  export enum EntitySignalStatus {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
  }

  export interface SyncPost {
    connectionId: string;
  }

  export interface SyncSubscription {
    [key: string]: any[];
  }

  export interface EntitySignalOptions {
    autoreconnect: boolean;
    reconnectMinTime: number;
    reconnectVariance: number;
    debug: boolean;
    suppressInternalDataProcessing: boolean;
    hubUrl: string;
  }

  type OnStatusChangedCallback = (status: EntitySignalStatus) => void;
  type OnSyncCallback = (newData: UserResult) => void;

  export class Client {
    subscriptions: SyncSubscription;
    hub: signalR.HubConnection;
    options: EntitySignalOptions;
    private connectingDefer: Promise<void>;
    connectionId: string;

    private onStatusChangeCallbacks: OnStatusChangedCallback[];
    private OnSyncCallbacks: OnSyncCallback[];

    private _status: EntitySignalStatus;
    get status(): EntitySignalStatus {
      return this._status;
    }
    set status(newStatus: EntitySignalStatus) {
      this._status = newStatus;
      this.onStatusChangeCallbacks.forEach(callback => {
        callback(newStatus);
      });
    }

    constructor(options?: EntitySignalOptions) {
      this.options = <EntitySignalOptions>{
        autoreconnect: true,
        debug: false,
        suppressInternalDataProcessing: false,
        hubUrl: "/dataHub",
        reconnectMinTime: 4000,
        reconnectVariance: 3000
      };

      if (options) {
        Object.assign(this.options, options);
      }

      this.onStatusChangeCallbacks = [];
      this.OnSyncCallbacks = [];

      this.subscriptions = {};
      this.status = EntitySignalStatus.Disconnected;

      this.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub", signalR.HttpTransportType.WebSockets).build();

      this.hub.onclose(() => {
        this.onClose();
      });

      this.hub.on("Sync", (data: UserResult) => {
        if (!this.options.suppressInternalDataProcessing) {
          this.processSync(data);
        }

        this.OnSyncCallbacks.forEach(callback => {
          callback(data);
        });
      });
    }

    onStatusChange(callback: OnStatusChangedCallback) {
      this.onStatusChangeCallbacks.push(callback);
    }

    onSync(callback: OnSyncCallback) {
      this.OnSyncCallbacks.push(callback);
    }

    private onClose() {
      this.status = EntitySignalStatus.Disconnected;
      this.reconnect();
    }

    debugPrint(output: string) {
      if (this.options.debug) {
        console.log(output);
      }
    }

    connect(): Promise<void> {
      if (this.status == EntitySignalStatus.Connected) {
        return Promise.resolve();
      }

      if (this.status == EntitySignalStatus.Connecting) {
        return this.connectingDefer;
      }

      this.debugPrint("Connecting");

      if (this.status == EntitySignalStatus.Disconnected) {
        this.status = EntitySignalStatus.Connecting;

        this.connectingDefer = new Promise(
          (resolve, reject) => {
            this.hub.start().then(
              x => {
                this.status = EntitySignalStatus.Connected;
                this.connectionId = signalR.connectionId;
                resolve();
              }
            ).catch(
              err => {
                this.debugPrint("Error Connecting");
                this.status = EntitySignal.EntitySignalStatus.Disconnected;
                reject(err);

                console.error(err.toString());
              }
            );
          }
        );

        return this.connectingDefer;
      }
    }

    reconnect() {
      if (this.options.autoreconnect == false) {
        return;
      }

      this.debugPrint("Reconnecting");

      this.connect().then(
        () => {
          this.debugPrint("Reconnect Success");

          for (var index in this.subscriptions) {
            this.hardRefresh(index);
          }
        },
        x => {
          this.debugPrint("Reconnect Failed");
          var reconnectTime = this.options.reconnectMinTime + (Math.random() * this.options.reconnectVariance);
          this.debugPrint("Attempting reconnect in " + reconnectTime + "ms");
          setTimeout(() => { this.reconnect(); }, reconnectTime);
        }
      );
    }

    processSync(data: UserResult) {
      data.urls.forEach(url => {
        url.data.forEach(x => {
          if (x.state == EntitySignal.EntityState.Added || x.state == EntitySignal.EntityState.Modified) {
            var changeCount = 0;
            this.subscriptions[url.url].forEach(msg => {
              if (x.object.id == msg.id) {
                angular.copy(x.object, msg);
                changeCount++;
              }
            })
            if (changeCount == 0) {
              this.subscriptions[url.url].push(x.object);
            }
          }
          else if (x.state == EntitySignal.EntityState.Deleted) {
            for (var i = this.subscriptions[url.url].length - 1; i >= 0; i--) {
              var currentRow = this.subscriptions[url.url][i];
              if (currentRow.id == x.object.id) {
                this.subscriptions[url.url].splice(i, 1);
              }
            }
          }

        })
      });
    }

    desyncFrom(url: string): Promise<void> {
      var newDefer = new Promise<void>((resolve, reject) => {

        this.hub.invoke("DeSyncFrom", url)
          .then(
            x => {
              resolve();
            },
            x => {
              reject(x);
            }
          );
      });

      return newDefer;
    }

    hardRefresh(url: string) {
      return new Promise((resolve, reject) => {
        this.connect().then(() => {
          var syncPost = <EntitySignal.SyncPost>{
            connectionId: this.connectionId
          }

          var xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
              if (xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);

                if (this.subscriptions[url] == null) {
                  this.subscriptions[url] = data;
                }
                else {
                  this.subscriptions[url].splice(0);
                  data.forEach(y => {
                    this.subscriptions[url].push(y);
                  });
                }

                resolve(this.subscriptions[url]);
              }
              else if (xhr.status == 204) {
                resolve(this.subscriptions[url]);
              }
              else {
                reject(xhr.responseText);
              }
            }
          }

          xhr.send(JSON.stringify(syncPost));

        });
      });
    }

    syncWith(url: string): Promise<any> {
      //if already subscribed to then return array
      if (this.subscriptions[url]) {
        return Promise.resolve(this.subscriptions[url])
      }

      return this.hardRefresh(url);
    };
  }
}