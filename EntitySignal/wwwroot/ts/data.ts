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

interface Message {
  id: number;
  name: string;
  message: string;
}

interface TestScope extends ng.IScope {
  messages: Message[];
  filterMessages: Message[];
  jokes: any[];
  guidJokes: any[];

  entitySignal: EntitySignal;

  createNew(): void;
  createFiveNew(): void;
  changeRandom(): void;
  deleteAll(): void;
  deleteRandom(): void;

  subscribeToMessages(): void;
  subscribeToOddIdMessages(): void;
  subscribeToJokes(): void;
  subscribeToGuidJokes(): void;
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
      vm.status = EntitySignalStatus.Disconnected;
      reconnect();
    });

    function reconnect() {
      $timeout(1000)
        .then(() => {
          connect().then(() => {
          },
            x => {
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
            //alert("Error connecting");
            vm.status = EntitySignalStatus.Disconnected;
            connectingDefer.reject(err);
          });
          
          return console.error(err.toString());
        });
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

    window["a"] = subscriptions;

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

angular.module("app", ["EntitySignal"])
  .run([
    "EntitySignal",
    function (
      EntitySignal: EntitySignal
    ) {

      var entitySignalOptions = <EntitySignalOptions>{
        autoreconnect: true
      };

      EntitySignal.options = entitySignalOptions;


    }]);
angular.module("app").controller("testController", [
  "$scope",
  "$http",
  "$timeout",
  "EntitySignal",
  function (
    $scope: TestScope,
    $http: ng.IHttpService,
    $timeout: ng.ITimeoutService,
    EntitySignal: EntitySignal
  ) {
    $scope.entitySignal = EntitySignal;

    $scope.createNew = () => {
      $http.get("/crud/create");
    };

    $scope.createFiveNew = () => {
      $http.get("/crud/createFive");
    };

    $scope.changeRandom = () => {
      $http.get("/crud/changeRandom");
    };

    $scope.deleteAll = () => {
      $http.get("/crud/deleteAll");
    };

    $scope.deleteRandom = () => {
      $http.get("/crud/deleteRandom");
    }

    $scope.subscribeToMessages = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToAllMessages")
        .then(x => {
          $scope.messages = x;
        })
    };

    $scope.subscribeToJokes = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToAllJokes")
        .then(x => {
          $scope.jokes = x;
        })
    };

    $scope.subscribeToOddIdMessages = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToOddIdMessages")
        .then(x => {
          $scope.filterMessages = x;
        })
    };

    $scope.subscribeToGuidJokes = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToJokesWithGuidAnswer")
        .then(x => {
          $scope.guidJokes = x;
        })
    };

    $scope.subscribeToMessages();
    $scope.subscribeToJokes();
    $scope.subscribeToGuidJokes();
    $scope.subscribeToOddIdMessages();
  }]);