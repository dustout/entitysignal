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
        var values;
        vm.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub").build();
        vm.hub.start().then(function (x) {
            vm.connectionId = signalR.connectionId;
        }).catch(function (err) {
            return console.error(err.toString());
        });
        vm.hub.on("Sync", function (data) {
            $timeout(function () {
                data.forEach(function (x) {
                    if (x.state == EntityState.Added) {
                        values.push(x.object);
                    }
                    else if (x.state == EntityState.Modified) {
                        values.forEach(function (msg) {
                            if (x.object.id == msg.id) {
                                msg.name = x.object.name;
                                msg.message = x.object.message;
                            }
                        });
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
                values = subscriptions[url];
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
        $scope.changeRandom = function () {
            $http.get("/home/ChangeRandom");
        };
        $scope.deleteAll = function () {
            $http.get("/home/DeleteAll");
        };
        $scope.test = function () {
            $http.get("/home/Test");
        };
        $scope.subscribe = function () {
            EntitySignal.syncWith("/home/SubscribeTest")
                .then(function (x) {
                $scope.messages = x;
            });
        };
    }
]);
//# sourceMappingURL=data.js.map