#### Install Scripts
*NPM:* `npm install entity-signal`
or
[download from GitHub](https://github.com/dustout/entitysignal/releases)

#### Add Javascript Files To Html After SignalR
```html
<script src="https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.min.js"></script>
<script src="~/dist/entitySignal.js"></script>
<script src="~/dist/angularJs/ngEntitySignal.js"></script>
```

#### Import EntitySignal Module and Start Connection
```javascript
angular.module("app", ["EntitySignal"]).run([
    "EntitySignal",
    function (
        EntitySignal
    ) {
        EntitySignal.client.connect();
    }]);
```

#### Import EntitySignal Module and Start Connection
```javascript
angular.module("app").controller("testController", [
  "$scope",
  "EntitySignal",
  function (
    $scope,
    EntitySignal
  ) {
    $scope.entitySignal = EntitySignal;

    $scope.subscribeToMessages = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToAllMessages")
        .then(x => {
          $scope.messages = x;
        })
    };

    $scope.subscribeToOddIdMessages = () => {
      EntitySignal.syncWith("/subscribe/SubscribeToOddIdMessages")
        .then(x => {
          $scope.filterMessages = x;
        })
    };

    $scope.subscribeToMessages();
    $scope.subscribeToOddIdMessages();
  }]);

```