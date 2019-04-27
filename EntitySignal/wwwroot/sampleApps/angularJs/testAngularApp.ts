interface Message {
  id: number;
  name: string;
  text: string;
}

interface TestScope extends ng.IScope {
  messages: Message[];
  filterMessages: Message[];
  jokes: any[];
  guidJokes: any[];

  maxMessagesCount: number;
  maxFilteredMessagesCount: number;
  maxJokesCount: number;
  maxGuidJokesCount: number;

  entitySignal: ngEntitySignal;

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

angular.module("app", ["EntitySignal"])
  .run([
    "EntitySignal",
    function (
      EntitySignal: ngEntitySignal
    ) {
      EntitySignal.client.options.debug = true;
      EntitySignal.client.connect();
    }]);
angular.module("app").controller("testController", [
  "$scope",
  "$http",
  "EntitySignal",
  function (
    $scope: TestScope,
    $http: ng.IHttpService,
    EntitySignal: ngEntitySignal
  ) {
    $scope.entitySignal = EntitySignal;

    $scope.maxMessagesCount = 4;
    $scope.maxFilteredMessagesCount = 4;
    $scope.maxJokesCount = 4;
    $scope.maxGuidJokesCount = 4;

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