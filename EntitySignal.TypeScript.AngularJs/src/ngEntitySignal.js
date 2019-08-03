angular.module("EntitySignal", []);
angular.module("EntitySignal").factory("EntitySignal", [
    "$q",
    "$timeout",
    function ($q, $timeout) {
        var vm = {};
        vm.client = new EntitySignal.Client();
        vm.client.options.suppressInternalDataProcessing = true;
        vm.status = vm.client.status;
        vm.client.onStatusChange(function (x) {
            $timeout().then(function () {
                vm.status = x;
            });
        });
        vm.client.onSync(function (x) {
            $timeout().then(function () {
                vm.client.processSync(x);
            });
        });
        vm.syncWith = function (url) {
            var syncDefer = $q.defer();
            vm.client.syncWith(url).then(function (x) {
                syncDefer.resolve(x);
            }, function (error) {
                syncDefer.reject(error);
            });
            return syncDefer.promise;
        };
        vm.hardRefresh = function (url) {
            var syncDefer = $q.defer();
            vm.hardRefresh(url).then(function (x) {
                syncDefer.resolve(x);
            }, function (error) {
                syncDefer.reject(error);
            });
            return syncDefer.promise;
        };
        vm.desyncFrom = function (url) {
            var syncDefer = $q.defer();
            vm.desyncFrom(url).then(function (x) {
                syncDefer.resolve(x);
            }, function (error) {
                syncDefer.reject(error);
            });
            return syncDefer.promise;
        };
        return vm;
    }
]);
//# sourceMappingURL=ngEntitySignal.js.map