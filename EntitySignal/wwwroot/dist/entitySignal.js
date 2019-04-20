var EntitySignal;
(function (EntitySignal) {
    var EntityState;
    (function (EntityState) {
        EntityState[EntityState["Detached"] = 0] = "Detached";
        EntityState[EntityState["Unchanged"] = 1] = "Unchanged";
        EntityState[EntityState["Deleted"] = 2] = "Deleted";
        EntityState[EntityState["Modified"] = 3] = "Modified";
        EntityState[EntityState["Added"] = 4] = "Added";
    })(EntityState = EntitySignal.EntityState || (EntitySignal.EntityState = {}));
    ;
    var EntitySignalStatus;
    (function (EntitySignalStatus) {
        EntitySignalStatus[EntitySignalStatus["Disconnected"] = 0] = "Disconnected";
        EntitySignalStatus[EntitySignalStatus["Connecting"] = 1] = "Connecting";
        EntitySignalStatus[EntitySignalStatus["Connected"] = 2] = "Connected";
        EntitySignalStatus[EntitySignalStatus["WaitingForConnectionId"] = 3] = "WaitingForConnectionId";
    })(EntitySignalStatus = EntitySignal.EntitySignalStatus || (EntitySignal.EntitySignalStatus = {}));
    var Client = /** @class */ (function () {
        function Client(options) {
            var _this = this;
            this.options = {
                autoreconnect: true,
                debug: false,
                suppressInternalDataProcessing: false,
                hubUrl: "/dataHub",
                reconnectMinTime: 4000,
                reconnectVariance: 3000,
                maxWaitForConnectionId: 5000
            };
            if (options) {
                Object.assign(this.options, options);
            }
            this.onStatusChangeCallbacks = [];
            this.OnSyncCallbacks = [];
            this.subscriptions = {};
            this.status = EntitySignalStatus.Disconnected;
            this.hub = new signalR.HubConnectionBuilder().withUrl("/dataHub", signalR.HttpTransportType.WebSockets).build();
            this.hub.onclose(function () {
                _this.onClose();
            });
            this.hub.on("Sync", function (data) {
                if (!_this.options.suppressInternalDataProcessing) {
                    _this.processSync(data);
                }
                _this.OnSyncCallbacks.forEach(function (callback) {
                    callback(data);
                });
            });
        }
        Object.defineProperty(Client.prototype, "status", {
            get: function () {
                return this._status;
            },
            set: function (newStatus) {
                this._status = newStatus;
                this.onStatusChangeCallbacks.forEach(function (callback) {
                    callback(newStatus);
                });
            },
            enumerable: true,
            configurable: true
        });
        Client.prototype.onStatusChange = function (callback) {
            this.onStatusChangeCallbacks.push(callback);
        };
        Client.prototype.onSync = function (callback) {
            this.OnSyncCallbacks.push(callback);
        };
        Client.prototype.onClose = function () {
            this.status = EntitySignalStatus.Disconnected;
            this.reconnect();
        };
        Client.prototype.debugPrint = function (output) {
            if (this.options.debug) {
                console.log(output);
            }
        };
        Client.prototype.connect = function () {
            var _this = this;
            if (this.status == EntitySignalStatus.Connected) {
                return Promise.resolve();
            }
            if (this.status == EntitySignalStatus.Connecting || this.status == EntitySignalStatus.WaitingForConnectionId) {
                return this.connectingDefer;
            }
            this.debugPrint("Connecting");
            if (this.status == EntitySignalStatus.Disconnected) {
                this.status = EntitySignalStatus.Connecting;
                this.connectingDefer = new Promise(function (resolve, reject) {
                    _this.hub.on("ConnectionIdChanged", function (connectionId) {
                        //this should be a one shot so just remove handler after first use
                        _this.hub.off("ConnectionIdChanged");
                        _this.status = EntitySignalStatus.Connected;
                        _this.connectionId = connectionId;
                        _this.debugPrint("Connected");
                        resolve();
                    });
                    _this.hub.start().then(function (x) {
                        _this.status = EntitySignalStatus.WaitingForConnectionId;
                        _this.debugPrint("Connected, waiting for connectionId");
                        setTimeout(function () { if (_this.status == EntitySignalStatus.WaitingForConnectionId) {
                            reject();
                        } }, _this.options.maxWaitForConnectionId);
                    }).catch(function (err) {
                        _this.debugPrint("Error Connecting");
                        _this.status = EntitySignal.EntitySignalStatus.Disconnected;
                        reject(err);
                        console.error(err.toString());
                    });
                });
                return this.connectingDefer;
            }
        };
        Client.prototype.reconnect = function () {
            var _this = this;
            if (this.options.autoreconnect == false) {
                return;
            }
            this.debugPrint("Reconnecting");
            this.connect().then(function () {
                _this.debugPrint("Reconnect Success");
                for (var index in _this.subscriptions) {
                    _this.hardRefresh(index);
                }
            }, function (x) {
                _this.debugPrint("Reconnect Failed");
                var reconnectTime = _this.options.reconnectMinTime + (Math.random() * _this.options.reconnectVariance);
                _this.debugPrint("Attempting reconnect in " + reconnectTime + "ms");
                setTimeout(function () { _this.reconnect(); }, reconnectTime);
            });
        };
        Client.prototype.processSync = function (data) {
            var _this = this;
            data.urls.forEach(function (url) {
                url.data.forEach(function (x) {
                    if (x.state == EntitySignal.EntityState.Added || x.state == EntitySignal.EntityState.Modified) {
                        var changeCount = 0;
                        _this.subscriptions[url.url].forEach(function (msg) {
                            if (x.object.id == msg.id) {
                                angular.copy(x.object, msg);
                                changeCount++;
                            }
                        });
                        if (changeCount == 0) {
                            _this.subscriptions[url.url].push(x.object);
                        }
                    }
                    else if (x.state == EntitySignal.EntityState.Deleted) {
                        for (var i = _this.subscriptions[url.url].length - 1; i >= 0; i--) {
                            var currentRow = _this.subscriptions[url.url][i];
                            if (currentRow.id == x.object.id) {
                                _this.subscriptions[url.url].splice(i, 1);
                            }
                        }
                    }
                });
            });
        };
        Client.prototype.desyncFrom = function (url) {
            var _this = this;
            var newDefer = new Promise(function (resolve, reject) {
                _this.hub.invoke("DeSyncFrom", url)
                    .then(function (x) {
                    resolve();
                }, function (x) {
                    reject(x);
                });
            });
            return newDefer;
        };
        Client.prototype.hardRefresh = function (url) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connect().then(function () {
                    var syncPost = {
                        connectionId: _this.connectionId
                    };
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                var data = JSON.parse(xhr.responseText);
                                if (_this.subscriptions[url] == null) {
                                    _this.subscriptions[url] = data;
                                }
                                else {
                                    _this.subscriptions[url].splice(0);
                                    data.forEach(function (y) {
                                        _this.subscriptions[url].push(y);
                                    });
                                }
                                resolve(_this.subscriptions[url]);
                            }
                            else if (xhr.status == 204) {
                                if (_this.subscriptions[url] == null) {
                                    _this.subscriptions[url] = data;
                                }
                                resolve(_this.subscriptions[url]);
                            }
                            else {
                                reject(xhr.responseText);
                            }
                        }
                    };
                    xhr.send(JSON.stringify(syncPost));
                });
            });
        };
        Client.prototype.syncWith = function (url) {
            //if already subscribed to then return array
            if (this.subscriptions[url]) {
                return Promise.resolve(this.subscriptions[url]);
            }
            return this.hardRefresh(url);
        };
        ;
        return Client;
    }());
    EntitySignal.Client = Client;
})(EntitySignal || (EntitySignal = {}));
//# sourceMappingURL=entitySignal.js.map