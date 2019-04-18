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

enum EntitySignalStatus {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2
}

interface EntitySignal {
  status: EntitySignalStatus;

  hub: signalR.HubConnection;
  connectionId: string;
  syncWith(url: string): ng.IPromise<any>;
  hardRefresh(url: string): ng.IPromise<any>;
  desyncFrom(url: string): ng.IPromise<any>;

  getSyncedUrls(): string[];

  options: EntitySignalOptions;
}

interface SyncPost {
  connectionId: string;
}

interface SyncSubscription {
  [key: string]: any[];
}

interface EntitySignalOptions {
  autoreconnect: boolean;
}

angular.module("EntitySignal", [])
angular.module("EntitySignal").factory("EntitySignal", [
  "$http",
  "$q",
  "$timeout",
  function (
    $http: ng.IHttpService,
    $q: ng.IQService,
    $timeout: ng.ITimeoutService
  ) {
    var vm: EntitySignal = <EntitySignal>{};
    vm.status = EntitySignalStatus.Disconnected;

    var subscriptions: SyncSubscription = {};
    var connectingDefer: ng.IDeferred<void>;

    vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub", signalR.HttpTransportType.WebSockets).build();

    vm.hub.onclose(() => {
      $timeout().then(() => {
        vm.status = EntitySignalStatus.Disconnected;
        reconnect();
      });
    });

    function reconnect() {
      console.log("Reconnecting");

      $timeout(3000 + (Math.random() * 4000))
        .then(() => {
          connect().then(() => {
            console.log("Reconnect Success");

            for (var index in subscriptions) {
              vm.hardRefresh(index);
            }
          },
            x => {
              console.log("Reconnect Failed");

              reconnect();
            });
        });
    }

    function connect(): ng.IPromise<void> {
      if (vm.status == EntitySignalStatus.Connected) {
        return $q.when();
      }

      if (vm.status == EntitySignalStatus.Connecting) {
        return connectingDefer.promise;
      }

      console.log("Connecting");

      if (vm.status == EntitySignalStatus.Disconnected) {
        vm.status = EntitySignalStatus.Connecting;
        connectingDefer = $q.defer<void>();

        vm.hub.start().then(function (x) {
          $timeout().then(() => {
            vm.status = EntitySignalStatus.Connected;
            vm.connectionId = signalR.connectionId;
            connectingDefer.resolve();
          });
        }).catch(function (err) {
          $timeout().then(() => {
            console.log("Error Connecting");
            vm.status = EntitySignalStatus.Disconnected;
            connectingDefer.reject(err);
          });

          return console.error(err.toString());
        });

        return connectingDefer.promise;
      }
    }
    connect();

    vm.hub.on("Sync", (data: UserResult) => {
      $timeout(() => {
        data.urls.forEach(url => {
          url.data.forEach(x => {
            if (x.state == EntityState.Added || x.state == EntityState.Modified) {
              var changeCount = 0;
              subscriptions[url.url].forEach(msg => {
                if (x.object.id == msg.id) {
                  angular.copy(x.object, msg);
                  changeCount++;
                }
              })
              if (changeCount == 0) {
                subscriptions[url.url].push(x.object);
              }
            }
            else if (x.state == EntityState.Deleted) {
              for (var i = subscriptions[url.url].length - 1; i >= 0; i--) {
                var currentRow = subscriptions[url.url][i];
                if (currentRow.id == x.object.id) {
                  subscriptions[url.url].splice(i, 1);
                }
              }
            }

          })
        });
      });
    });

    vm.getSyncedUrls = () => {
      var urls = [];

      for (var propertyName in subscriptions) {
        console.log(propertyName);
      }

      return urls;
    }

    vm.hardRefresh = url => {
      console.log("Hard refreshing url:" + url)

      //if not already subscribed to then just do regular sync
      if (!subscriptions[url]) {
        return vm.syncWith(url);
      }

      //otherwise do hard refresh
      return connect().then(
        () => {
          var syncPost = <SyncPost>{
            connectionId: vm.connectionId
          }

          return $http.post<any[]>(url, syncPost)
            .then(x => {
              if (subscriptions[url] == null) {
                subscriptions[url] = x.data;
              }
              else {
                subscriptions[url].splice(0);
                x.data.forEach(y => {
                  subscriptions[url].push(y);
                });
              }

              return subscriptions[url];
            },
              x => {
                subscriptions[url].splice(0);
              }
            );
        }
      );

    }

    vm.desyncFrom = url => {
      var newDefer = $q.defer<void>();

      vm.hub.invoke("DeSyncFrom", url)
        .then(x => {
          newDefer.resolve(x);
        },
          x => {
            newDefer.reject(x);
          });

      return newDefer.promise;
    }

    vm.syncWith = url => {
      //if already subscribed to then return array
      if (subscriptions[url]) {
        return $q.when(subscriptions[url]);
      }

      //otherwise attempt to subscribe
      return connect().then(() => {
        var syncPost = <SyncPost>{
          connectionId: vm.connectionId
        }

        return $http.post<any[]>(url, syncPost)
          .then(x => {
            if (subscriptions[url] == null) {
              subscriptions[url] = x.data;
            }

            return subscriptions[url];
          });
      })
    };

    return vm;
  }
])