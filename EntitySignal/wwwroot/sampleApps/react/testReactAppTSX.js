var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var client = new EntitySignal.Client();
client.options.returnDeepCopy = true;
client.connect();
var DataSyncTest = (function (_super) {
    __extends(DataSyncTest, _super);
    function DataSyncTest(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            maxMessages: 4,
            messages: []
        };
        return _this;
    }
    DataSyncTest.prototype.showAllMessages = function () {
        this.setState({
            maxMessages: null
        });
    };
    DataSyncTest.prototype.componentDidMount = function () {
        var _this = this;
        client.syncWith(this.props.url)
            .then(function (x) {
            _this.setState({
                messages: x
            });
        });
        this.onDataChangeId = client.onDataChange(this.props.url, function (urlData) {
            _this.setState({
                messages: urlData
            });
        });
    };
    DataSyncTest.prototype.componentWillUnmount = function () {
        client.offDataChange(this.props.url, this.onDataChangeId);
    };
    DataSyncTest.prototype.render = function () {
        var sortedMessages = this.state.messages.sort(function (a, b) {
            if (a.id < b.id) {
                return 1;
            }
            else {
                return -1;
            }
        });
        if (this.state.maxMessages) {
            sortedMessages = sortedMessages.slice(0, this.state.maxMessages);
        }
        var messagesDisplay = sortedMessages.map(function (message) {
            return React.createElement("pre", { key: message.Id.toString() }, JSON.stringify(message, null, 2));
        });
        return (React.createElement("div", null,
            React.createElement("h4", null, this.props.title),
            React.createElement("div", null, messagesDisplay),
            this.state.maxMessages && this.state.messages.length > this.state.maxMessages ? (React.createElement("button", { className: "btn btn-secondary btn-block", onClick: this.showAllMessages.bind(this) },
                React.createElement("i", { className: "fas fa-arrow-down" }),
                " Show ",
                this.state.messages.length - this.state.maxMessages,
                " More")) : (React.createElement("p", null))));
    };
    return DataSyncTest;
}(React.Component));
var TopButtons = (function (_super) {
    __extends(TopButtons, _super);
    function TopButtons() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopButtons.prototype.getUrl = function (url) {
        axios.get(url);
    };
    TopButtons.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: "row pb-3" },
                React.createElement("div", { className: "col-6" },
                    React.createElement("button", { onClick: this.getUrl.bind(this, "/crud/create"), className: "btn btn-primary btn-block btn-lg" }, "Create 1 New")),
                React.createElement("div", { className: "col-6" },
                    React.createElement("button", { onClick: this.getUrl.bind(this, "/crud/createFive"), className: "btn btn-primary btn-block btn-lg" }, "Create 5 New"))),
            React.createElement("div", { className: "row pb-3" },
                React.createElement("div", { className: "col-12" },
                    React.createElement("button", { onClick: this.getUrl.bind(this, "/crud/changeRandom"), className: "btn btn-primary btn-block btn-lg" }, "Change Random"))),
            React.createElement("div", { className: "row pb-3" },
                React.createElement("div", { className: "col-6" },
                    React.createElement("button", { onClick: this.getUrl.bind(this, "/crud/deleteAll"), className: "btn btn-primary btn-block btn-lg" }, "Delete All")),
                React.createElement("div", { className: "col-6" },
                    React.createElement("button", { onClick: this.getUrl.bind(this, "/crud/deleteRandom"), className: "btn btn-primary btn-block btn-lg" }, "Delete Random")))));
    };
    return TopButtons;
}(React.Component));
var ConnectionStatus = (function (_super) {
    __extends(ConnectionStatus, _super);
    function ConnectionStatus(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            status: client.status
        };
        return _this;
    }
    ConnectionStatus.prototype.componentDidMount = function () {
        var _this = this;
        this.onStatusChangeId = client.onStatusChange(function (newStatus) {
            _this.setState({
                status: newStatus
            });
        });
    };
    ConnectionStatus.prototype.componentWillUnmount = function () {
        client.offStatusChange(this.onStatusChangeId);
    };
    ConnectionStatus.prototype.render = function () {
        var statusHtml = null;
        if (this.state.status == EntitySignal.EntitySignalStatus.Connected) {
            statusHtml = (React.createElement("div", { className: "card border-success mb-3" },
                React.createElement("div", { className: "card-body" },
                    React.createElement("p", { className: "card-text" },
                        React.createElement("strong", { className: "text-success" }, "Connected"),
                        " to entity framework through signalr"))));
        }
        else if (this.state.status == EntitySignal.EntitySignalStatus.Disconnected) {
            statusHtml = (React.createElement("div", { className: "card mb-3" },
                React.createElement("div", { className: "card-body" },
                    React.createElement("p", { className: "card-text" },
                        React.createElement("strong", null, "Disconnected")))));
        }
        else if (this.state.status == EntitySignal.EntitySignalStatus.WaitingForConnectionId) {
            statusHtml = (React.createElement("div", { className: "card mb-3 border-primary" },
                React.createElement("div", { className: "card-body" },
                    React.createElement("p", { className: "card-text" },
                        React.createElement("strong", { className: "text-primary" }, "Waiting"),
                        " for connectionId"))));
        }
        else if (this.state.status == EntitySignal.EntitySignalStatus.Connecting) {
            statusHtml = (React.createElement("div", { className: "card mb-3 border-primary" },
                React.createElement("div", { className: "card-body" },
                    React.createElement("p", { className: "card-text" },
                        React.createElement("strong", { className: "text-primary" }, "Connecting"),
                        " to entity framework through signalr"))));
        }
        return (React.createElement("div", { className: "row" },
            React.createElement("div", { className: "col text-center" }, statusHtml)));
    };
    return ConnectionStatus;
}(React.Component));
var DataResults = (function (_super) {
    __extends(DataResults, _super);
    function DataResults() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataResults.prototype.render = function () {
        return (React.createElement("div", { className: "row" },
            React.createElement("div", { className: "col-sm-6 col-lg-3" },
                React.createElement(DataSyncTest, { url: "/subscribe/SubscribeToAllMessages", title: "Messages" })),
            React.createElement("div", { className: "col-sm-6 col-lg-3" },
                React.createElement(DataSyncTest, { url: "/subscribe/SubscribeToOddIdMessages", title: "Messages with odd id" })),
            React.createElement("div", { className: "col-sm-6 col-lg-3" },
                React.createElement(DataSyncTest, { url: "/subscribe/SubscribeToAllJokes", title: "Jokes" })),
            React.createElement("div", { className: "col-sm-6 col-lg-3" },
                React.createElement(DataSyncTest, { url: "/subscribe/SubscribeToJokesWithGuidAnswer", title: "Jokes with guid answer" }))));
    };
    return DataResults;
}(React.Component));
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(ConnectionStatus, null),
            React.createElement(TopButtons, null),
            React.createElement(DataResults, null)));
    };
    return App;
}(React.Component));
ReactDOM.render(React.createElement(App, null), document.getElementById('app'));
//# sourceMappingURL=testReactAppTSX.js.map