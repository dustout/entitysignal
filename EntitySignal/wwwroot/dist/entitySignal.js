var EntitySignal;
(function (EntitySignal) {
    var EntityState;
    (function (EntityState) {
        EntityState[EntityState["Detached"] = 0] = "Detached";
        EntityState[EntityState["Unchanged"] = 1] = "Unchanged";
        EntityState[EntityState["Deleted"] = 2] = "Deleted";
        EntityState[EntityState["Modified"] = 3] = "Modified";
        EntityState[EntityState["Added"] = 4] = "Added";
    })(EntityState || (EntityState = {}));
    ;
    var EntitySignalStatus;
    (function (EntitySignalStatus) {
        EntitySignalStatus[EntitySignalStatus["Disconnected"] = 0] = "Disconnected";
        EntitySignalStatus[EntitySignalStatus["Connecting"] = 1] = "Connecting";
        EntitySignalStatus[EntitySignalStatus["Connected"] = 2] = "Connected";
        EntitySignalStatus[EntitySignalStatus["WaitingForConnectionId"] = 3] = "WaitingForConnectionId";
    })(EntitySignalStatus = EntitySignal.EntitySignalStatus || (EntitySignal.EntitySignalStatus = {}));
    var Client = (function () {
        function Client(options) {
            var _this = this;
            this.options = {
                autoreconnect: true,
                debug: false,
                suppressInternalDataProcessing: false,
                hubUrl: "/dataHub",
                reconnectMinTime: 4000,
                reconnectVariance: 3000,
                maxWaitForConnectionId: 5000,
                returnDeepCopy: false,
                defaultId: "id"
            };
            if (options) {
                Object.assign(this.options, options);
            }
            this.onStatusChangeCallbacks = [];
            this.onSyncCallbacks = [];
            this.onUrlCallbacks = {};
            this.subscriptions = {};
            this.status = EntitySignalStatus.Disconnected;
            this.hub = new window["signalR"].HubConnectionBuilder().withUrl("/dataHub", signalR.HttpTransportType.WebSockets).build();
            this.hub.onclose(function () {
                _this.onClose();
            });
            this.hub.on("Sync", function (data) {
                if (!_this.options.suppressInternalDataProcessing) {
                    _this.processSync(data);
                }
                _this.onSyncCallbacks.forEach(function (callback) {
                    callback(data);
                });
                data.urls.forEach(function (x) {
                    var urlCallbacks = _this.onUrlCallbacks[x.url];
                    if (!urlCallbacks) {
                        return;
                    }
                    urlCallbacks.forEach(function (callback) {
                        if (_this.options.returnDeepCopy) {
                            var deepCopy = JSON.parse(JSON.stringify(_this.subscriptions[x.url]));
                            callback(deepCopy);
                        }
                        else {
                            callback(_this.subscriptions[x.url]);
                        }
                    });
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
        Client.prototype.onDataChange = function (url, callback) {
            var urlCallbackArray = this.onUrlCallbacks[url];
            if (!urlCallbackArray) {
                this.onUrlCallbacks[url] = [];
                urlCallbackArray = this.onUrlCallbacks[url];
            }
            urlCallbackArray.push(callback);
            return callback;
        };
        Client.prototype.offDataChange = function (url, callback) {
            var urlCallbackArray = this.onUrlCallbacks[url];
            if (!urlCallbackArray) {
                return;
            }
            var callbackIndex = urlCallbackArray.indexOf(callback);
            if (callbackIndex == -1) {
                return;
            }
            urlCallbackArray.splice(callbackIndex, 1);
        };
        Client.prototype.onStatusChange = function (callback) {
            this.onStatusChangeCallbacks.push(callback);
            return callback;
        };
        Client.prototype.offStatusChange = function (callback) {
            var callbackIndex = this.onStatusChangeCallbacks.indexOf(callback);
            if (callbackIndex == -1) {
                return;
            }
            this.onStatusChangeCallbacks.splice(callbackIndex, 1);
        };
        Client.prototype.onSync = function (callback) {
            this.onSyncCallbacks.push(callback);
            return callback;
        };
        Client.prototype.offSync = function (callback) {
            var callbackIndex = this.onSyncCallbacks.indexOf(callback);
            if (callbackIndex == -1) {
                return;
            }
            this.onSyncCallbacks.splice(callbackIndex, 1);
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
                        _this.hub.off("ConnectionIdChanged");
                        _this.status = EntitySignalStatus.Connected;
                        _this.connectionId = connectionId;
                        _this.debugPrint("Connected");
                        resolve();
                    });
                    _this.hub.start().then(function (x) {
                        if (_this.status == EntitySignalStatus.Connecting) {
                            _this.debugPrint("Connected, waiting for connectionId");
                            _this.status = EntitySignalStatus.WaitingForConnectionId;
                        }
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
            var changedUrls = [];
            data.urls.forEach(function (url) {
                changedUrls.push(url.url);
                url.data.forEach(function (x) {
                    if (x.state == EntityState.Added || x.state == EntityState.Modified) {
                        var changeCount = 0;
                        _this.subscriptions[url.url].forEach(function (msg, index) {
                            if (x.object[_this.options.defaultId] == msg[_this.options.defaultId]) {
                                _this.subscriptions[url.url].splice(index, 1, x.object);
                                changeCount++;
                            }
                        });
                        if (changeCount == 0) {
                            _this.subscriptions[url.url].push(x.object);
                        }
                    }
                    else if (x.state == EntityState.Deleted) {
                        for (var i = _this.subscriptions[url.url].length - 1; i >= 0; i--) {
                            var currentRow = _this.subscriptions[url.url][i];
                            if (currentRow[_this.options.defaultId] == x.object[_this.options.defaultId]) {
                                _this.subscriptions[url.url].splice(i, 1);
                            }
                        }
                    }
                });
            });
            return changedUrls;
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
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('SignalRConnectionId', _this.connectionId);
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
                                if (_this.options.returnDeepCopy) {
                                    var deepCopy = JSON.parse(JSON.stringify(_this.subscriptions[url]));
                                    resolve(deepCopy);
                                }
                                else {
                                    resolve(_this.subscriptions[url]);
                                }
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
                    xhr.send();
                });
            });
        };
        Client.prototype.syncWith = function (url) {
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