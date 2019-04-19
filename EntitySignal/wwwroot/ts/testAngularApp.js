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
        $scope.maxMessagesCount = 4;
        $scope.maxFilteredMessagesCount = 4;
        $scope.maxJokesCount = 4;
        $scope.maxGuidJokesCount = 4;
        $scope.createNew = function () {
            $http.get("/crud/create");
        };
        $scope.createFiveNew = function () {
            $http.get("/crud/createFive");
        };
        $scope.changeRandom = function () {
            $http.get("/crud/changeRandom");
        };
        $scope.deleteAll = function () {
            $http.get("/crud/deleteAll");
        };
        $scope.deleteRandom = function () {
            $http.get("/crud/deleteRandom");
        };
        $scope.subscribeToMessages = function () {
            EntitySignal.syncWith("/subscribe/SubscribeToAllMessages")
                .then(function (x) {
                $scope.messages = x;
            });
        };
        $scope.subscribeToJokes = function () {
            EntitySignal.syncWith("/subscribe/SubscribeToAllJokes")
                .then(function (x) {
                $scope.jokes = x;
            });
        };
        $scope.subscribeToOddIdMessages = function () {
            EntitySignal.syncWith("/subscribe/SubscribeToOddIdMessages")
                .then(function (x) {
                $scope.filterMessages = x;
            });
        };
        $scope.subscribeToGuidJokes = function () {
            EntitySignal.syncWith("/subscribe/SubscribeToJokesWithGuidAnswer")
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
//# sourceMappingURL=testAngularApp.js.map