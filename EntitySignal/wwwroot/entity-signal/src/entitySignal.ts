namespace EntitySignal {
  enum EntityState {
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

  interface UserResult {
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
    Connected = 2,
    WaitingForConnectionId = 3
  }

  interface SyncPost {
    connectionId: string;
  }

  interface SyncSubscription {
    [key: string]: any[];
  }

  export interface EntitySignalOptions {
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
  }

  type OnStatusChangedCallback = (status: EntitySignalStatus) => void;
  type OnSyncCallback = (newData: UserResult) => void;
  type OnUrlDataChangeCallback = (urlData:any) => void;

  interface UrlCallbackContainer {
    [key: string]: OnUrlDataChangeCallback[];
  }

  export class Client {
    subscriptions: SyncSubscription;
    hub: any;
    options: EntitySignalOptions;
    private connectingDefer: Promise<void>;
    connectionId: string;

    private onStatusChangeCallbacks: OnStatusChangedCallback[];
    private onSyncCallbacks: OnSyncCallback[];
    private onUrlCallbacks: UrlCallbackContainer;

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
        reconnectVariance: 3000,
        maxWaitForConnectionId: 5000,
        returnDeepCopy: false,
        defaultId: "id"
      };

      if (options) {
        Object.assign(this.options, options);
      }

      this.onStatusChangeCallbacks = [];
      this.onSyncCallbacks = [];
      this.onUrlCallbacks = <UrlCallbackContainer> {};

      this.subscriptions = {};
      this.status = EntitySignalStatus.Disconnected;

      this.hub = new window["signalR"].HubConnectionBuilder().withUrl(this.options.hubUrl, window["signalR"].HttpTransportType.WebSockets).build();

      this.hub.onclose(() => {
        this.onClose();
      });

      this.hub.on("Sync", (data: UserResult) => {

        if (!this.options.suppressInternalDataProcessing) {
          this.processSync(data);
        }

        this.onSyncCallbacks.forEach(callback => {
          callback(data);
        });

        data.urls.forEach(x => {
          var urlCallbacks = this.onUrlCallbacks[x.url];
          if (!urlCallbacks) {
            return;
          }

          urlCallbacks.forEach(callback => {
            if (this.options.returnDeepCopy) {
              var deepCopy = JSON.parse(JSON.stringify(this.subscriptions[x.url]));
              callback(deepCopy);
            }
            else {
              callback(this.subscriptions[x.url])
            }
          })
        })
      });
    }

    onDataChange(url: string, callback: OnUrlDataChangeCallback) {
      var urlCallbackArray = this.onUrlCallbacks[url];

      if (!urlCallbackArray) {
        this.onUrlCallbacks[url] = [];
        urlCallbackArray = this.onUrlCallbacks[url];
      }

      urlCallbackArray.push(callback);

      return callback;
    }

    offDataChange(url: string, callback: OnUrlDataChangeCallback) {
      var urlCallbackArray = this.onUrlCallbacks[url];

      if (!urlCallbackArray) {
        return;
      }

      var callbackIndex = urlCallbackArray.indexOf(callback);
      if (callbackIndex == -1) {
        return;
      }
      urlCallbackArray.splice(callbackIndex, 1);
    }

    onStatusChange(callback: OnStatusChangedCallback) {
      this.onStatusChangeCallbacks.push(callback);

      return callback;
    }

    offStatusChange(callback: OnStatusChangedCallback) {
      var callbackIndex = this.onStatusChangeCallbacks.indexOf(callback);
      if (callbackIndex == -1) {
        return;
      }
      this.onStatusChangeCallbacks.splice(callbackIndex, 1);
    }

    onSync(callback: OnSyncCallback) {
      this.onSyncCallbacks.push(callback);
      return callback;
    }

    offSync(callback: OnSyncCallback) {
      var callbackIndex = this.onSyncCallbacks.indexOf(callback);
      if (callbackIndex == -1) {
        return;
      }
      this.onSyncCallbacks.splice(callbackIndex, 1);
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

      if (this.status == EntitySignalStatus.Connecting || this.status == EntitySignalStatus.WaitingForConnectionId) {
        return this.connectingDefer;
      }

      this.debugPrint("Connecting");

      if (this.status == EntitySignalStatus.Disconnected) {
        this.status = EntitySignalStatus.Connecting;

        this.connectingDefer = new Promise(
          (resolve, reject) => {
            this.hub.on("ConnectionIdChanged", (connectionId: string) => {

              //this should be a one shot so just remove handler after first use
              this.hub.off("ConnectionIdChanged");

              this.status = EntitySignalStatus.Connected;
              this.connectionId = connectionId;

              this.debugPrint("Connected");

              resolve();
            });

            this.hub.start().then(
              x => {
                if (this.status == EntitySignalStatus.Connecting) {
                  this.debugPrint("Connected, waiting for connectionId");
                  this.status = EntitySignalStatus.WaitingForConnectionId;
                }

                setTimeout(() => { if (this.status == EntitySignalStatus.WaitingForConnectionId) { reject() } }, this.options.maxWaitForConnectionId);
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
      var changedUrls: string[] = [];

      data.urls.forEach(url => {
        changedUrls.push(url.url);
        url.data.forEach(x => {
          if (x.state == EntityState.Added || x.state == EntityState.Modified) {
            var changeCount = 0;
            this.subscriptions[url.url].forEach((msg, index) => {
              if (x.object[this.options.defaultId] == msg[this.options.defaultId]) {
                this.subscriptions[url.url].splice(index, 1, x.object);
                changeCount++;
              }
            })
            if (changeCount == 0) {
              this.subscriptions[url.url].push(x.object);
            }
          }
          else if (x.state == EntityState.Deleted) {
            for (var i = this.subscriptions[url.url].length - 1; i >= 0; i--) {
              var currentRow = this.subscriptions[url.url][i];
              if (currentRow[this.options.defaultId] == x.object[this.options.defaultId]) {
                this.subscriptions[url.url].splice(i, 1);
              }
            }
          }
        })
      });

      return changedUrls;
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

          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('x-signalr-connection-id', this.connectionId);

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

                if (this.options.returnDeepCopy) {
                  var deepCopy = JSON.parse(JSON.stringify(this.subscriptions[url]));
                  resolve(deepCopy);
                }
                else {
                  resolve(this.subscriptions[url]);
                }
              }
              else if (xhr.status == 204) {
                if (this.subscriptions[url] == null) {
                  this.subscriptions[url] = data;
                }

                resolve(this.subscriptions[url]);
              }
              else {
                reject(xhr.responseText);
              }
            }
          }

          xhr.send();
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