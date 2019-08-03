/// <reference path="node_modules/entity-signal/wwwroot/dist/entitySignal.ts"/>

var client = new EntitySignal.Client();
client.options.debug = true;
client.connect();

var data = {
  messages: null,
  jokes: null,
  filterMessages: null,
  guidJokes: null,
  maxMessagesCount: 4,
  maxFilteredMessagesCount: 4,
  maxJokesCount: 4,
  maxGuidJokesCount: 4,
  client: client
};

var methods = {
  createNew: () => {
    Vue.http.get("/crud/create");
  },
  createFiveNew: () => {
    Vue.http.get("/crud/createFive");
  },
  changeRandom: () => {
    Vue.http.get("/crud/changeRandom");
  },
  deleteAll: () => {
    Vue.http.get("/crud/deleteAll");
  },
  deleteRandom: () => {
    Vue.http.get("/crud/deleteRandom");
  }
}

var computed = {
  cMessages: () => {
    if (!data.messages) {
      return null;
    }

    var orderedArray: any[] = data.messages.sort((a, b) => {
      if (a.id < b.id) {
        return 1;
      }
      else {
        return -1;
      }
    });

    if (data.maxMessagesCount) {
      return orderedArray.slice(0, data.maxMessagesCount);
    }
    else {
      return orderedArray;
    }
  },
  cJokes: () => {
    if (!data.jokes) {
      return null;
    }

    var orderedArray: any[] = data.jokes.sort((a, b) => {
      if (a.id < b.id) {
        return 1;
      }
      else {
        return -1;
      }
    });

    if (data.maxJokesCount) {
      return orderedArray.slice(0, data.maxJokesCount);
    }
    else {
      return orderedArray;
    }
  },
  cFilterMessages: () => {
    if (!data.filterMessages) {
      return null;
    }

    var orderedArray: any[] = data.filterMessages.sort((a, b) => {
      if (a.id < b.id) {
        return 1;
      }
      else {
        return -1;
      }
    });

    if (data.maxFilteredMessagesCount) {
      return orderedArray.slice(0, data.maxFilteredMessagesCount);
    }
    else {
      return orderedArray;
    }
  },
  cGuidJokes: () => {
    if (!data.guidJokes) {
      return null;
    }

    var orderedArray: any[] = data.guidJokes.sort((a, b) => {
      if (a.id < b.id) {
        return 1;
      }
      else {
        return -1;
      }
    });

    if (data.maxGuidJokesCount) {
      return orderedArray.slice(0, data.maxGuidJokesCount);
    }
    else {
      return orderedArray;
    }
  }
}

client.syncWith("/subscribe/SubscribeToAllMessages")
  .then(x => {
    data.messages = x;
  });

client.syncWith("/subscribe/SubscribeToAllJokes")
  .then(x => {
    data.jokes = x;
  })
client.syncWith("/subscribe/SubscribeToOddIdMessages")
  .then(x => {
    data.filterMessages = x;
  })
client.syncWith("/subscribe/SubscribeToJokesWithGuidAnswer")
  .then(x => {
    data.guidJokes = x;
  })

new Vue({
  el: '#test-vue-app',
  data: data,
  methods: methods,
  computed:computed
});