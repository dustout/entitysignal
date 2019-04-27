declare var axios: any;

var client = new EntitySignal.Client();
client.options.returnDeepCopy = true;
client.connect();

interface DataSyncTestProps {
  url: string;
  title: string;
}

interface DataSyncTestState {
  maxMessages: number;
  messages: any[];
}

class DataSyncTest extends React.Component<DataSyncTestProps, DataSyncTestState> {
  onDataChangeId: any;

  constructor(props: DataSyncTestProps) {
    super(props);
    this.state = {
      maxMessages: 4,
      messages: []
    };
  }

  showAllMessages() {
    this.setState({
      maxMessages: null
    });
  }

  componentDidMount() {
    client.syncWith(this.props.url)
      .then(x => {
        this.setState({
          messages: x
        });
      });

    this.onDataChangeId = client.onDataChange(this.props.url, urlData => {
      this.setState({
        messages: urlData
      })
    })
  }

  componentWillUnmount() {
    client.offDataChange(this.props.url, this.onDataChangeId);
  }

  render() {
    var sortedMessages: any[] = this.state.messages.sort((a, b) => {
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

    const messagesDisplay = sortedMessages.map((message) =>
      <pre key={message.id.toString()}>
        {JSON.stringify(message, null, 2)}
      </pre>
    );

    return (
      <div>
        <h4>{this.props.title}</h4>
        <div>{messagesDisplay}</div>
        {
          this.state.maxMessages && this.state.messages.length > this.state.maxMessages ? (
            <button className="btn btn-secondary btn-block" onClick={this.showAllMessages.bind(this)} >
              <i className="fas fa-arrow-down"></i> Show { this.state.messages.length - this.state.maxMessages } More
              </button>
          ) : (
              <p></p>
            )
        }
      </div>
    );
  }
}

class TopButtons extends React.Component {
  getUrl(url: string) {
    axios.get(url);
  }

  render() {
    return (
      <div>
        <div className="row pb-3">
          <div className="col-6">
            <button onClick={this.getUrl.bind(this, "/crud/create")} className="btn btn-primary btn-block btn-lg">Create 1 New</button>
          </div>
          <div className="col-6">
            <button onClick={this.getUrl.bind(this, "/crud/createFive")} className="btn btn-primary btn-block btn-lg">Create 5 New</button>
          </div>
        </div>
        <div className="row pb-3">
          <div className="col-12">
            <button onClick={this.getUrl.bind(this, "/crud/changeRandom")} className="btn btn-primary btn-block btn-lg">Change Random</button>
          </div>
        </div>
        <div className="row pb-3">
          <div className="col-6">
            <button onClick={this.getUrl.bind(this, "/crud/deleteAll")} className="btn btn-primary btn-block btn-lg">Delete All</button>
          </div>
          <div className="col-6">
            <button onClick={this.getUrl.bind(this, "/crud/deleteRandom")} className="btn btn-primary btn-block btn-lg">Delete Random</button>
          </div>
        </div>
      </div>
    )
  }
}

class ConnectionStatus extends React.Component<{}, { status: EntitySignal.EntitySignalStatus }> {
  onStatusChangeId: any;

  constructor(props: DataSyncTestProps) {
    super(props);
    this.state = {
      status: client.status
    };
  }

  componentDidMount() {
    this.onStatusChangeId = client.onStatusChange(newStatus => {
      this.setState({
        status: newStatus
      });
    });
  }

  componentWillUnmount() {
    client.offStatusChange(this.onStatusChangeId);
  }

  render() {
    var statusHtml: JSX.Element = null;

    if (this.state.status == EntitySignal.EntitySignalStatus.Connected) {
      statusHtml = (<div className="card border-success mb-3">
        <div className="card-body">
          <p className="card-text">
            <strong className="text-success">Connected</strong> to entity framework through signalr
          </p>
        </div>
      </div>);
    }
    else if (this.state.status == EntitySignal.EntitySignalStatus.Disconnected) {
      statusHtml = (<div className="card mb-3">
        <div className="card-body">
          <p className="card-text">
            <strong>Disconnected</strong>
          </p>
        </div>
      </div>);
    }
    else if (this.state.status == EntitySignal.EntitySignalStatus.WaitingForConnectionId) {
      statusHtml = (<div className="card mb-3 border-primary">
        <div className="card-body">
          <p className="card-text">
            <strong className="text-primary">Waiting</strong> for connectionId
          </p>
        </div>
      </div>);
    }
    else if (this.state.status == EntitySignal.EntitySignalStatus.Connecting) {
      statusHtml = (<div className="card mb-3 border-primary">
        <div className="card-body">
          <p className="card-text">
            <strong className="text-primary">Connecting</strong> to entity framework through signalr
          </p>
        </div>
      </div>);
    }

    return (
      <div className="row">
        <div className="col text-center">
          {statusHtml}
        </div>
      </div>
    )
  }
}

class DataResults extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-sm-6 col-lg-3">
          <DataSyncTest url="/subscribe/SubscribeToAllMessages" title="Messages" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <DataSyncTest url="/subscribe/SubscribeToOddIdMessages" title="Messages with odd id" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <DataSyncTest url="/subscribe/SubscribeToAllJokes" title="Jokes" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <DataSyncTest url="/subscribe/SubscribeToJokesWithGuidAnswer" title="Jokes with guid answer" />
        </div>
      </div>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <ConnectionStatus />
        <TopButtons />
        <DataResults />
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);