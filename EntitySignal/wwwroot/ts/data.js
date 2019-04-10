var EntityState;
(function (EntityState) {
    EntityState[EntityState["Detached"] = 0] = "Detached";
    EntityState[EntityState["Unchanged"] = 1] = "Unchanged";
    EntityState[EntityState["Deleted"] = 2] = "Deleted";
    EntityState[EntityState["Modified"] = 3] = "Modified";
    EntityState[EntityState["Added"] = 4] = "Added";
})(EntityState || (EntityState = {}));
;
var EntitySignalStatus;
(function (EntitySignalStatus) {
    EntitySignalStatus[EntitySignalStatus["Disconnected"] = 0] = "Disconnected";
    EntitySignalStatus[EntitySignalStatus["Connecting"] = 1] = "Connecting";
    EntitySignalStatus[EntitySignalStatus["Connected"] = 2] = "Connected";
})(EntitySignalStatus || (EntitySignalStatus = {}));
angular.module("EntitySignal", []);
angular.module("EntitySignal").factory("EntitySignal", [
    "$http",
    "$q",
    "$timeout",
    function ($http, $q, $timeout) {
        var vm = {};
        vm.status = EntitySignalStatus.Disconnected;
        var subscriptions = {};
        var connectingDefer;
        vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub", signalR.HttpTransportType.WebSockets).build();
        vm.hub.onclose(function () {
            vm.status = EntitySignalStatus.Disconnected;
            reconnect();
        });
        function reconnect() {
            $timeout(1000)
                .then(function () {
                connect().then(function () {
                }, function (x) {
                    reconnect();
                });
            });
        }
        function connect() {
            if (vm.status == EntitySignalStatus.Connected) {
                return $q.when();
            }
            if (vm.status == EntitySignalStatus.Connecting) {
                return connectingDefer.promise;
            }
            if (vm.status == EntitySignalStatus.Disconnected) {
                vm.status = EntitySignalStatus.Connecting;
                connectingDefer = $q.defer();
                vm.hub.start().then(function (x) {
                    $timeout().then(function () {
                        vm.status = EntitySignalStatus.Connected;
                        vm.connectionId = signalR.connectionId;
                        connectingDefer.resolve();
                    });
                }).catch(function (err) {
                    $timeout().then(function () {
                        //alert("Error connecting");
                        vm.status = EntitySignalStatus.Disconnected;
                        connectingDefer.reject(err);
                    });
                    return console.error(err.toString());
                });
            }
        }
        connect();
        vm.hub.on("Sync", function (data) {
            $timeout(function () {
                data.urls.forEach(function (url) {
                    url.data.forEach(function (x) {
                        if (x.state == EntityState.Added || x.state == EntityState.Modified) {
                            var changeCount = 0;
                            subscriptions[url.url].forEach(function (msg) {
                                if (x.object.id == msg.id) {
                                    angular.copy(x.object, msg);
                                    changeCount++;
                                }
                            });
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
                    });
                });
            });
        });
        vm.getSyncedUrls = function () {
            var urls = [];
            for (var propertyName in subscriptions) {
                console.log(propertyName);
            }
            return urls;
        };
        window["a"] = subscriptions;
        vm.syncWith = function (url) {
            //if already subscribed to then return array
            if (subscriptions[url]) {
                return $q.when(subscriptions[url]);
            }
            //otherwise attempt to subscribe
            return connect().then(function () {
                var syncPost = {
                    connectionId: vm.connectionId
                };
                return $http.post(url, syncPost)
                    .then(function (x) {
                    if (subscriptions[url] == null) {
                        subscriptions[url] = x.data;
                    }
                    return subscriptions[url];
                });
            });
        };
        return vm;
    }
]);
angular.module("app", ["EntitySignal"])
    .run([
    "EntitySignal",
    function (EntitySignal) {
        var entitySignalOptions = {
            autoreconnect: true
        };
        EntitySignal.options = entitySignalOptions;
    }
]);
angular.module("app").controller("testController", [
    "$scope",
    "$http",
    "$timeout",
    "EntitySignal",
    function ($scope, $http, $timeout, EntitySignal) {
        $scope.entitySignal = EntitySignal;
        $scope.createNew = function () {
            $http.get("/home/create");
        };
        $scope.createFiveNew = function () {
            $http.get("/home/createFive");
        };
        $scope.changeRandom = function () {
            $http.get("/home/ChangeRandom");
        };
        $scope.deleteAll = function () {
            $http.get("/home/DeleteAll");
        };
        $scope.deleteRandom = function () {
            $http.get("/home/DeleteRandom");
        };
        $scope.test = function () {
            $http.get("/home/Test");
        };
        $scope.subscribeToMessages = function () {
            EntitySignal.syncWith("/home/SubscribeTest")
                .then(function (x) {
                $scope.messages = x;
            });
        };
        $scope.subscribeToJokes = function () {
            EntitySignal.syncWith("/home/SubscribeJokesTest")
                .then(function (x) {
                $scope.jokes = x;
            });
        };
        $scope.subscribeToOddIdMessages = function () {
            EntitySignal.syncWith("/home/SubscribeFilterTest")
                .then(function (x) {
                $scope.filterMessages = x;
            });
        };
        $scope.subscribeToGuidJokes = function () {
            EntitySignal.syncWith("/home/SubscribeGuidJokesTest")
                .then(function (x) {
                $scope.guidJokes = x;
            });
        };
        $scope.subscribeToMessages();
        $scope.subscribeToJokes();
        $scope.subscribeToGuidJokes();
        $scope.subscribeToOddIdMessages();
    }
]);
//# sourceMappingURL=data.js.map