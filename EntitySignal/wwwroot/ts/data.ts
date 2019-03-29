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

interface testScope extends ng.IScope {
  messages: Message[];
  filterMessages: Message[];
  jokes: any[];
  guidJokes: any[];

  createNew(): void;
  createFiveNew(): void;
  changeRandom(): void;
  deleteAll(): void;
  test(): void;

  subscribeToMessages(): void;
  subscribeToOddIdMessages(): void;
  subscribeToJokes(): void;
  subscribeToGuidJokes(): void;
}

interface EntitySignal {
  hub: signalR.HubConnection;
  connectionId: string;
  syncWith(url: string): ng.IPromise<any>;
}

interface SyncPost {
  connectionId: string;
}

interface SyncSubscription {
  [key: string]: any[];
}

angular.module("EntitySignal", [])
angular.module("EntitySignal").factory("EntitySignal", [
  "$http",
  "$q",
  "$timeout",
  function (
    $http: ng.IHttpService,
    $q: ng.IQService,
    $timeout :ng.ITimeoutService
  ) {
    var vm: EntitySignal = <EntitySignal>{};

    var subscriptions: SyncSubscription = {};

    vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub").build();
    vm.hub.start().then(function (x) {
      vm.connectionId = signalR.connectionId;
    }).catch(function (err) {
      return console.error(err.toString());
      });

    vm.hub.on("Sync", (data: DataContainer<Message>[], url:string) => {
      $timeout(() => {
        data.forEach(x => {
          if (x.state == EntityState.Added) {
            subscriptions[url].push(x.object);
          }
          else if (x.state == EntityState.Modified) {
            var changeCount = 0;
            subscriptions[url].forEach(msg => {
              if (x.object.id == msg.id) {
                angular.copy(x.object, msg);
                changeCount++;
              }
            })
            if (changeCount == 0) {
              subscriptions[url].push(x.object);
            }
          }
          else if (x.state == EntityState.Deleted) {
            for (var i = subscriptions[url].length - 1; i >= 0; i--) {
              var currentRow = subscriptions[url][i];
              if (currentRow.id == x.object.id) {
                subscriptions[url].splice(i, 1);
              }
            }
          }
        });
      });
    });

    vm.syncWith = url => {
      var syncPost = <SyncPost>{
        connectionId: vm.connectionId
      }

      //if already subscribed to then return array
      if (subscriptions[url]) {
        return $q.when(subscriptions[url]);
      }

      //otherwise attempt to subscribe
      return $http.post<any[]>(url, syncPost)
        .then(x => {
          if (subscriptions[url] == null) {
            subscriptions[url] = x.data;
          }

          return subscriptions[url];
        });
    };

    return vm;
  }
])

angular.module("app", ["EntitySignal"]);
angular.module("app").controller("testController", [
  "$scope",
  "$http",
  "$timeout",
  "EntitySignal",
  function (
    $scope: testScope,
    $http: ng.IHttpService,
    $timeout: ng.ITimeoutService,
    EntitySignal: EntitySignal
  ) {
    $scope.createNew = () => {
      $http.get("/home/create");
    };

    $scope.createFiveNew = () => {
      $http.get("/home/createFive");
    };

    $scope.changeRandom = () => {
      $http.get("/home/ChangeRandom");
    };

    $scope.deleteAll = () => {
      $http.get("/home/DeleteAll");
    };

    $scope.test = () => {
      $http.get("/home/Test");
    };

    $scope.subscribeToMessages = () => {
      EntitySignal.syncWith("/home/SubscribeTest")
        .then(x => {
          $scope.messages = x;
        })
    };

    $scope.subscribeToJokes = () => {
      EntitySignal.syncWith("/home/SubscribeJokesTest")
        .then(x => {
          $scope.jokes = x;
        })
    };

    $scope.subscribeToOddIdMessages = () => {
      EntitySignal.syncWith("/home/SubscribeFilterTest")
        .then(x => {
          $scope.filterMessages = x;
        })
    };

    $scope.subscribeToGuidJokes = () => {
      EntitySignal.syncWith("/home/SubscribeGuidJokesTest")
        .then(x => {
          $scope.guidJokes = x;
        })
    };
  }]);