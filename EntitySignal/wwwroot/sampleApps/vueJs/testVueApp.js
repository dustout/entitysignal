var client = new EntitySignal.Client();
client.options.debug = true;
client.connect();
var data2 = {
    list: null,
    status: client.status
};
var syncList;
client.syncWith("/subscribe/SubscribeToAllMessages")
    .then(function (x) {
    data2.list = x;
    syncList = x;
});
//# sourceMappingURL=testVueApp.js.map