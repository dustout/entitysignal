declare var Vue: any;
declare var _: any;


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
    var orderedArray: any[] = _.orderBy(data.messages, 'id', 'desc');
    if (data.maxMessagesCount) {
      return orderedArray.slice(0, data.maxMessagesCount);
    }
    else {
      return orderedArray;
    }
  },
  cJokes: () => {
    var orderedArray: any[] = _.orderBy(data.jokes, 'id', 'desc');
    if (data.maxJokesCount) {
      return orderedArray.slice(0, data.maxJokesCount);
    }
    else {
      return orderedArray;
    }
  },
  cFilterMessages: () => {
    var orderedArray: any[] = _.orderBy(data.filterMessages, 'id', 'desc');
    if (data.maxFilteredMessagesCount) {
      return orderedArray.slice(0, data.maxFilteredMessagesCount);
    }
    else {
      return orderedArray;
    }
  },
  cGuidJokes: () => {
    var orderedArray: any[] = _.orderBy(data.guidJokes, 'id', 'desc');
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
  el: '#app2',
  data: data,
  methods: methods,
  computed:computed
});