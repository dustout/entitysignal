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
    createNew: function () {
        Vue.http.get("/crud/create");
    },
    createFiveNew: function () {
        Vue.http.get("/crud/createFive");
    },
    changeRandom: function () {
        Vue.http.get("/crud/changeRandom");
    },
    deleteAll: function () {
        Vue.http.get("/crud/deleteAll");
    },
    deleteRandom: function () {
        Vue.http.get("/crud/deleteRandom");
    }
};
var computed = {
    cMessages: function () {
        var orderedArray = _.orderBy(data.messages, 'id', 'desc');
        if (data.maxMessagesCount) {
            return orderedArray.slice(0, data.maxMessagesCount);
        }
        else {
            return orderedArray;
        }
    },
    cJokes: function () {
        var orderedArray = _.orderBy(data.jokes, 'id', 'desc');
        if (data.maxJokesCount) {
            return orderedArray.slice(0, data.maxJokesCount);
        }
        else {
            return orderedArray;
        }
    },
    cFilterMessages: function () {
        var orderedArray = _.orderBy(data.filterMessages, 'id', 'desc');
        if (data.maxFilteredMessagesCount) {
            return orderedArray.slice(0, data.maxFilteredMessagesCount);
        }
        else {
            return orderedArray;
        }
    },
    cGuidJokes: function () {
        var orderedArray = _.orderBy(data.guidJokes, 'id', 'desc');
        if (data.maxGuidJokesCount) {
            return orderedArray.slice(0, data.maxGuidJokesCount);
        }
        else {
            return orderedArray;
        }
    }
};
client.syncWith("/subscribe/SubscribeToAllMessages")
    .then(function (x) {
    data.messages = x;
});
client.syncWith("/subscribe/SubscribeToAllJokes")
    .then(function (x) {
    data.jokes = x;
});
client.syncWith("/subscribe/SubscribeToOddIdMessages")
    .then(function (x) {
    data.filterMessages = x;
});
client.syncWith("/subscribe/SubscribeToJokesWithGuidAnswer")
    .then(function (x) {
    data.guidJokes = x;
});
new Vue({
    el: '#test-vue-app',
    data: data,
    methods: methods,
    computed: computed
});
//# sourceMappingURL=testVueApp.js.map