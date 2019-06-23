const { Component, useState, useEffect } = React;
const { createStore, bindActionCreators, applyMiddleware } = Redux;
const { Provider, connect } = ReactRedux;
const thunk = ReduxThunk.default;

const FETCH_SUCCESS = "FETCH_SUCCESS";
const FETCH_FAILED = "FETCH_FAILED";

const channels = [
"ESL_SC2",
"OgamingSC2",
"cretetion",
"freecodecamp",
"storbeck",
"habathcx",
"RobotCaleb",
"noobs2ninjas"];


/*========app.js=========*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      online: false,
      offline: false };


    this.btn1 = React.createRef();
    this.btn2 = React.createRef();
    this.btn3 = React.createRef();

    this.showAll = this.showAll.bind(this);
    this.removeOnline = this.removeOnline.bind(this);
    this.removeOffline = this.removeOffline.bind(this);
  }

  componentDidMount() {
    this.props.action();
    this.btn1.current.classList.add('nav-btn-color');
  }

  showAll(e) {
    e.preventDefault();
    this.btn1.current.classList.add('nav-btn-color');
    this.btn2.current.classList.remove('nav-btn-color');
    this.btn3.current.classList.remove('nav-btn-color');
    this.setState({
      online: false,
      offline: false });

  }

  removeOnline(e) {
    e.preventDefault();
    this.btn1.current.classList.remove('nav-btn-color');
    this.btn2.current.classList.add('nav-btn-color');
    this.btn3.current.classList.remove('nav-btn-color');
    this.setState({
      online: true,
      offline: false });

  }

  removeOffline(e) {
    e.preventDefault();
    this.btn1.current.classList.remove('nav-btn-color');
    this.btn2.current.classList.remove('nav-btn-color');
    this.btn3.current.classList.add('nav-btn-color');
    this.setState({
      online: false,
      offline: true });

  }

  render() {
    let streams = this.props.streams;
    let online = this.state.online;
    let offline = this.state.offline;

    if (online) {
      let online = streams.filter(obj => {
        return obj.stream !== null;
      });
      streams = online;
    } else if (offline) {
      let offline = streams.filter(obj => {
        return obj.stream == null;
      });
      streams = offline;
    }

    return (
      React.createElement("div", { className: "main" },
      React.createElement("div", { className: "nav-group" },
      React.createElement("h1", { className: "nav-title" }, "Twitch Streams"),
      React.createElement("div", { className: "nav-btn",
        onClick: this.showAll,
        ref: this.btn1 }, "all"),
      React.createElement("div", { className: "nav-btn",
        onClick: this.removeOnline,
        ref: this.btn2 }, "online"),
      React.createElement("div", { className: "nav-btn",
        onClick: this.removeOffline,
        ref: this.btn3 }, "offline")),

      React.createElement(Lists, { streams: streams })));


  }}


/*========components=========*/

class Lists extends Component {

  renderLists(streams) {
    return streams.map(data => {
      let live = 'live',color = "green",user,game,url,
      title,views,id,followers;

      const stream = data.stream;

      if (stream === null) {
        const linkChannel = data._links.channel;
        const baseLinkChannel = "https://api.twitch.tv/kraken/channels/";
        user = linkChannel.split(baseLinkChannel)[1];
        live = 'offline';
        color = 'red';
      } else {
        const props = data.stream.channel;
        title = props.status;
        id = props._id;
        user = props.display_name;
        game = props.game;
        url = props.url;
        views = props.views;
        followers = props.followers;
      }

      return (
        React.createElement("a", { href: url, keys: id, target: "_blank", className: "table" },
        React.createElement("div", { className: "flex-wrapper" },

        React.createElement("div", { className: "user-stats" },
        React.createElement("div", { className: "username" }, user),
        React.createElement("div", { className: "user-info" },
        React.createElement("span", { style: { color: color }, className: "live" }, live),
        React.createElement("span", { className: "views" }, "views: ", views),
        React.createElement("span", { className: "followers" }, "followers: ", followers))),



        React.createElement("div", { className: "title-info" },
        React.createElement("div", { className: "title" }, title),
        React.createElement("div", { className: "game" }, game ? "(" + game + ")" : '')))));






    });
  }

  render() {
    const { streams } = this.props;
    return (
      React.createElement("div", { className: "list" },
      this.renderLists(streams)));


  }}


/*========reducers=========*/

const reducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_SUCCESS:
      return action.payload.map(res => res.data);
    default:
      return state;}

};

/*========actions=========*/
const base = `https://wind-bow.glitch.me/twitch-api`;
const type = `/streams/`;

const action = () => async dispatch => {
  let axiosArray = [];

  for (let i = 0; i < channels.length; i++) {
    let channel = channels[i],
    url = `${base}${type}${channel}`;
    axiosArray.push(axios.get(url));
  }

  const responses = await axios.all(axiosArray);
  dispatch({ type: FETCH_SUCCESS, payload: responses });
};

/*========store=========*/
const mapStateToProps = state => {
  return { streams: state };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ action }, dispatch);
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
React.createElement(Provider, { store: store },
React.createElement(AppContainer, null)),

document.getElementById('root'));