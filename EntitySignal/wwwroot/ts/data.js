var EntityState;
(function (EntityState) {
    EntityState[EntityState["Detached"] = 0] = "Detached";
    EntityState[EntityState["Unchanged"] = 1] = "Unchanged";
    EntityState[EntityState["Deleted"] = 2] = "Deleted";
    EntityState[EntityState["Modified"] = 3] = "Modified";
    EntityState[EntityState["Added"] = 4] = "Added";
})(EntityState || (EntityState = {}));
;
angular.module("EntitySignal", []);
angular.module("EntitySignal").factory("EntitySignal", [
    "$http",
    "$q",
    "$timeout",
    function ($http, $q, $timeout) {
        var vm = {};
        var subscriptions = {};
        vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub").build();
        vm.hub.start().then(function (x) {
            vm.connectionId = signalR.connectionId;
        }).catch(function (err) {
            return console.error(err.toString());
        });
        vm.hub.on("Sync", function (data, url) {
            $timeout(function () {
                data.forEach(function (x) {
                    if (x.state == EntityState.Added || x.state == EntityState.Modified) {
                        var changeCount = 0;
                        subscriptions[url].forEach(function (msg) {
                            if (x.object.id == msg.id) {
                                angular.copy(x.object, msg);
                                changeCount++;
                            }
                        });
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
        vm.syncWith = function (url) {
            var syncPost = {
                connectionId: vm.connectionId
            };
            //if already subscribed to then return array
            if (subscriptions[url]) {
                return $q.when(subscriptions[url]);
            }
            //otherwise attempt to subscribe
            return $http.post(url, syncPost)
                .then(function (x) {
                if (subscriptions[url] == null) {
                    subscriptions[url] = x.data;
                }
                return subscriptions[url];
            });
        };
        return vm;
    }
]);
angular.module("app", ["EntitySignal"]);
angular.module("app").controller("testController", [
    "$scope",
    "$http",
    "$timeout",
    "EntitySignal",
    function ($scope, $http, $timeout, EntitySignal) {
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
    }
]);
//# sourceMappingURL=data.js.map