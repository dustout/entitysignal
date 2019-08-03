/// <reference path="../../EntitySignal.TypeScript/src/entitySignal.ts"/>


interface ngEntitySignal {
  syncWith(url: string): ng.IPromise<any>;
  hardRefresh(url: string): ng.IPromise<any>;
  desyncFrom(url: string): ng.IPromise<any>;

  client: EntitySignal.Client;
  status: EntitySignal.EntitySignalStatus;
}

angular.module("EntitySignal", [])
angular.module("EntitySignal").factory("EntitySignal", [
  "$q",
  "$timeout",
  function (
    $q: ng.IQService,
    $timeout: ng.ITimeoutService
  ) {
    var vm: ngEntitySignal = <ngEntitySignal>{};

    vm.client = new EntitySignal.Client()
    vm.client.options.suppressInternalDataProcessing = true;

    vm.status = vm.client.status;
    vm.client.onStatusChange(x => {
      $timeout().then(() => {
        vm.status = x;
      });
    });

    vm.client.onSync(x => {
      $timeout().then(() => {
        vm.client.processSync(x);
      })
    });

    vm.syncWith = (url: string) => { 
      var syncDefer = $q.defer<any>();

      vm.client.syncWith(url).then(
        x => {
          syncDefer.resolve(x);
        },
        error => {
          syncDefer.reject(error);
        });

      return syncDefer.promise;
    };

    vm.hardRefresh = (url: string) => {
      var syncDefer = $q.defer<any>();

      vm.hardRefresh(url).then(
        x => {
          syncDefer.resolve(x);
        },
        error => {
          syncDefer.reject(error);
        });

      return syncDefer.promise;
    };

    vm.desyncFrom = (url: string) => {
      var syncDefer = $q.defer<any>();

      vm.desyncFrom(url).then(
        x => {
          syncDefer.resolve(x);
        },
        error => {
          syncDefer.reject(error);
        });

      return syncDefer.promise;
    };

    return vm;
  }
])