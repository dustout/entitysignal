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
            $timeout().then(function () {
                vm.status = EntitySignalStatus.Disconnected;
                reconnect();
            });
        });
        function reconnect() {
            if (vm.options && vm.options.autoreconnect == false) {
                return;
            }
            console.log("Reconnecting");
            $timeout(3000 + (Math.random() * 4000))
                .then(function () {
                connect().then(function () {
                    console.log("Reconnect Success");
                    for (var index in subscriptions) {
                        vm.hardRefresh(index);
                    }
                }, function (x) {
                    console.log("Reconnect Failed");
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
            console.log("Connecting");
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
        vm.hardRefresh = function (url) {
            console.log("Hard refreshing url:" + url);
            //if not already subscribed to then just do regular sync
            if (!subscriptions[url]) {
                return vm.syncWith(url);
            }
            //otherwise do hard refresh
            return connect().then(function () {
                var syncPost = {
                    connectionId: vm.connectionId
                };
                return $http.post(url, syncPost)
                    .then(function (x) {
                    if (subscriptions[url] == null) {
                        subscriptions[url] = x.data;
                    }
                    else {
                        subscriptions[url].splice(0);
                        x.data.forEach(function (y) {
                            subscriptions[url].push(y);
                        });
                    }
                    return subscriptions[url];
                }, function (x) {
                    subscriptions[url].splice(0);
                });
            });
        };
        vm.desyncFrom = function (url) {
            var newDefer = $q.defer();
            vm.hub.invoke("DeSyncFrom", url)
                .then(function (x) {
                newDefer.resolve(x);
            }, function (x) {
                newDefer.reject(x);
            });
            return newDefer.promise;
        };
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
//# sourceMappingURL=ngEntitySignal.js.map