var client = new EntitySignal.Client();
client.options.debug = true;
client.connect();

var data2 = {
  list: null,
  status:client.status
};

var syncList;


client.syncWith("/subscribe/SubscribeToAllMessages")
  .then(x => {
    data2.list = x;
    syncList = x;
  });




declare var Vue: any;
//declare var MyPlugin: any;

//var data = {
//  list: null
//};

//Vue.http.get("/subscribe/SubscribeToAllMessages").then(function (response) {
//  data.list = response.data;
//}, function (error) {
//  console.log(error.statusText);
//});

//new Vue({
//  el: '#app',
//  data: data
//});

new Vue({
  el: '#app2',
  data: data2
});