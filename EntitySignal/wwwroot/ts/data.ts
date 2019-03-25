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

  createNew(): void;
  changeRandom(): void;
  deleteAll(): void;
  test(): void;

  subscribe(): void;
}

interface EntitySignal {
  hub: signalR.HubConnection;
  connectionId: string;
  syncWith(url: string): ng.IPromise<any>;
}

interface SyncPost {
  connectionId: string;
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

    var subscriptions = {};

    var values:any[];

    vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub").build();
    vm.hub.start().then(function (x) {
      vm.connectionId = signalR.connectionId;
    }).catch(function (err) {
      return console.error(err.toString());
      });

    vm.hub.on("Sync", (data: DataContainer<Message>[]) => {
      $timeout(() => {
        data.forEach(x => {
          if (x.state == EntityState.Added) {
            values.push(x.object);
          }
          else if (x.state == EntityState.Modified) {
            values.forEach(msg => {
              if (x.object.id == msg.id) {
                msg.name = x.object.name;
                msg.message = x.object.message;
              }
            })
          }
          else if (x.state == EntityState.Deleted) {
            for (var i = values.length - 1; i >= 0; i--) {
              var currentRow = values[i];
              if (currentRow.id == x.object.id) {
                values.splice(i, 1);
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
      return $http.post(url, syncPost)
        .then(x => {
          if (subscriptions[url] == null) {
            subscriptions[url] = x.data;
          }
          values = subscriptions[url];

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

    $scope.changeRandom = () => {
      $http.get("/home/ChangeRandom");
    };

    $scope.deleteAll = () => {
      $http.get("/home/DeleteAll");
    };

    $scope.test = () => {
      $http.get("/home/Test");
    };

    $scope.subscribe = () => {
      EntitySignal.syncWith("/home/SubscribeTest")
        .then(x => {
          $scope.messages = x;
        })
    };
  }]);